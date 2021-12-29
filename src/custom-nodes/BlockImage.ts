import {
  addEmbedEditOverlay,
  loadTemplateInNode,
  makeSpoilerable,
} from "./utils";

import BlockImageHtml from "./templates/BlockImage.html";
import Quill from "quill";

const Image = Quill.import("formats/image");
const BlockEmbed = Quill.import("blots/block/embed");
const Icon = Quill.import("ui/icons");

const log = require("debug")("bobapost:embeds:block-image");

/**
 * BlockImage is a block node (as opposed to inline) containing a
 * single image. Unlike the classic image type, the block image
 * will take the whole line by default.
 */
export type SavedValue =
  | {
      src: string;
      spoilers?: boolean;
      width: number;
      height: number;
    }
  | string;
type Value = { loadPromise: Promise<string | ArrayBuffer> } | SavedValue;

const setImageValue = (img: HTMLImageElement, src: string) => {
  img.setAttribute("src", src);
  img.classList.add("image");
};

// TODO: can this just be display: none?
const removeLoadingOverlay = (rootNode: HTMLElement) => {
  const spinner = rootNode.querySelector(".spinner");
  if (spinner) {
    spinner.parentElement?.removeChild(spinner);
  }
  rootNode.classList.remove("loading");
};

class BlockImage extends BlockEmbed {
  static create(value: Value) {
    const node = super.create();
    loadTemplateInNode(node, BlockImageHtml);

    // TODO: choose a more descriptive name for this class
    const img = node.querySelector(".image") as HTMLImageElement;
    img.onload = () => {
      removeLoadingOverlay(node);
      if (BlockImage.onLoadCallback) {
        BlockImage.onLoadCallback();
      }
    };
    const src = typeof value === "string" ? value : value["src"];
    log(`Image value:`);
    log(value);
    if (src) {
      setImageValue(img, this.sanitize(src));
      img.setAttribute("src", this.sanitize(src));
    }
    if (value["width"] || value["height"]) {
      img.setAttribute("width", `${value["width"]}px`);
      img.setAttribute("height", `${value["height"]}px`);
    }
    makeSpoilerable(this, node, value);
    addEmbedEditOverlay(this, node);
    node.appendChild(img);

    // TODO: test this special case
    if (value["loadPromise"]) {
      (value["loadPromise"] as Promise<string | ArrayBuffer>)
        .then((src) => {
          setImageValue(img, this.sanitize(src));
        })
        .catch(() => {
          removeLoadingOverlay(node);
          node.classList.add("error");
        });
    }

    return node;
  }
  static sanitize(src: string | ArrayBuffer) {
    return Image.sanitize(src);
  }

  static setOnLoadCallback(callback: () => void) {
    BlockImage.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement): SavedValue | null {
    const img = domNode.querySelector<HTMLImageElement>("img.image");
    if (!img) {
      return null;
    }
    return {
      src: img.getAttribute("src")!,
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  }
}

BlockImage.blotName = "block-image";
BlockImage.tagName = "DIV";
BlockImage.className = "block-image-class";

Icon["block-image"] = Quill.import("ui/icons")["image"];

export default BlockImage;
