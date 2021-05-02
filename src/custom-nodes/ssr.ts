import type { SavedValue as BlockImageSavedValue } from "./BlockImage";
import type Quill from "quill";

export const BlockImage = (savedValue: BlockImageSavedValue) => {
  const value = {
    src: typeof savedValue === "string" ? savedValue : savedValue.src,
    width: typeof savedValue === "string" ? undefined : savedValue.width + "px",
    height:
      typeof savedValue === "string" ? undefined : savedValue.height + "px",
    spoilers: typeof savedValue === "string" ? false : savedValue.spoilers,
  };
  const spoilersBlock = `<div class="embed-overlay" style="width:100%;height:${value.height};"></div>`;
  const imageBlock = `<img src="${value.src}" ${
    value.width && `width="${value.width}"`
  } ${value.height && `height="${value.height}"`} />`;
  return `<div class="block-image-class ql-block-image ql-embed${
    value.spoilers ? " spoilers" : ""
  }" contenteditable="false">${
    value.spoilers ? spoilersBlock : ""
  }${imageBlock}</div>`;
};

export class FakeInlineModule {
  static order = [];
  constructor(domNode: HTMLElement) {}
  formats(domNode: HTMLElement) {}
  optimize(context: any) {}
}

/**
 * Imports a Quill module in a SSR-safe way (i.e. without importing Quill server-side).
 *
 * NOTE: this has been only tested on inline modules. Use with caution.
 * NOTE2: In case of circular imports, this will cause errors during rendering.
 */
export const importQuillModule = (moduleName: string) => {
  let QuillModule: typeof Quill;
  if (typeof window !== "undefined") {
    QuillModule = require("quill") as typeof Quill;
  } else {
    QuillModule = ({ import: () => FakeInlineModule } as any) as typeof Quill;
  }
  return QuillModule.import(moduleName);
};

// NOTE/TODO
// Spoilers won't work when switching from editable to non-editable without unmounting
// the embed, and when editing something already marked as a spoiler.
// This is not a problem for now but will need to be addressed in the future.
export const makeSpoilerable = (
  embedType: any,
  embedRoot: HTMLElement,
  embedValue: { spoilers?: boolean } | any
) => {
  const isSpoilered =
    embedType.value(embedRoot)?.["spoilers"] || embedValue.spoilers;
  embedRoot.addEventListener("click", () => {
    embedRoot.classList.toggle("show-spoilers");
  });
  if (isSpoilered) {
    embedRoot?.classList.toggle("spoilers", isSpoilered);
  }
  if (!embedType.onMarkSpoilers) {
    embedType.onMarkSpoilers = (node: HTMLDivElement, spoilers: boolean) => {
      if (spoilers) {
        node.setAttribute("spoilers", "true");
      } else {
        node.removeAttribute("spoilers");
      }
    };
  }
  if (!embedType.spoilersAugmented) {
    const previousValue = embedType.value;
    embedType.value = (domNode: HTMLElement) => {
      const value = previousValue(domNode);
      const spoilers = domNode.getAttribute("spoilers");
      return {
        ...value,
        spoilers: !!spoilers,
      };
    };

    const previousHash = embedType.getHashForCache;
    embedType.getHashForCache = (value: { spoilers?: boolean } | any) => {
      const hash = previousHash(value);
      return hash + (value?.spoilers ? "_spoilers" : "");
    };
    embedType.spoilersAugmented = true;
  }
};
