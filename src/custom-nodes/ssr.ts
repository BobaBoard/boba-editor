import { EmbedValue, TweetEmbed as TweetEmbedInterface } from "../config";

import type { SavedValue as BlockImageSavedValue } from "./BlockImage";
import type { HTMLElement as ParserHTMLElement } from "node-html-parser";
import type Quill from "quill";
import TwitterSsrTemplate from "./templates/TwitterSSR.html";
import { parse } from "node-html-parser";

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
    QuillModule = { import: () => FakeInlineModule } as any as typeof Quill;
  }
  return QuillModule.import(moduleName);
};

// TODO: figurte out why we aren't using the one in utils.ts for this.
export const makeSpoilerable = (
  embedType: any,
  embedRoot: HTMLElement,
  embedValue: { spoilers?: boolean } | any
) => {
  const isSpoilered =
    embedType.value?.(embedRoot)?.["spoilers"] || embedValue.spoilers;
  embedRoot.addEventListener("click", () => {
    embedRoot.classList.toggle("show-spoilers");
  });
  if (isSpoilered) {
    embedRoot?.classList.toggle("spoilers", isSpoilered);
    embedRoot?.setAttribute("spoilers", "true");
  }
  if (!embedType.onMarkSpoilers) {
    embedType.onMarkSpoilers = (node: HTMLDivElement, spoilers: boolean) => {
      if (spoilers) {
        node.setAttribute("spoilers", "true");
      } else {
        node.removeAttribute("spoilers");
        node?.classList.toggle("spoilers", spoilers);
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

const getTweetValues = (
  value: string | EmbedValue | TweetEmbedInterface
): TweetEmbedInterface => {
  console.log(value);
  if (typeof value === "string") {
    const url = new URL(value);
    return {
      url: value,
      href: value,
      did: url.pathname.substr(url.pathname.lastIndexOf("/") + 1),
    };
  }
  const url = new URL(value.url);
  return {
    url: value.url,
    href: value.url,
    embedWidth: value.embedWidth,
    embedHeight: value.embedHeight,
    did: url.pathname.substr(url.pathname.lastIndexOf("/") + 1),
    spoilers: "spoilers" in value ? value.spoilers : undefined,
    thread: "thread" in value ? value.thread : undefined,
  };
};

const setOrRemoveAttribute = (
  node: ParserHTMLElement,
  attribute: string,
  value: string | undefined
) => {
  if (typeof value !== "undefined") {
    node.setAttribute(attribute, value);
  } else {
    node.removeAttribute(attribute);
  }
};

export const TweetEmbed = (
  value: string | EmbedValue | TweetEmbedInterface
) => {
  const tweetValues = getTweetValues(value);
  const template = TwitterSsrTemplate;
  const node = parse(template);
  node.setAttribute("data-url", tweetValues.href);
  node.setAttribute("data-id", tweetValues.did);
  setOrRemoveAttribute(node, "data-embed-width", tweetValues.embedWidth);
  setOrRemoveAttribute(node, "data-embed-height", tweetValues.embedHeight);
  setOrRemoveAttribute(node, "data-id", tweetValues.embedHeight);
  node
    .querySelector(".loading-message a")
    ?.setAttribute("href", tweetValues.href);
  const loadingMessage = node.querySelector(".loading-message");
  if (loadingMessage && tweetValues.embedHeight && tweetValues.embedWidth) {
    const ratio =
      (parseInt(tweetValues.embedHeight) / parseInt(tweetValues.embedWidth)) *
      100;
    loadingMessage.setAttribute("style", `padding-top: ${ratio}%`);
  }

  return node.removeWhitespace().toString();
};
