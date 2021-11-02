import { addEmbedEditOverlay, makeSpoilerable } from "./utils";

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

class BlockImage extends BlockEmbed {
  static create(value: Value) {
    const node = super.create();
    const img = document.createElement("IMG");
    img.onload = () => {
      node.removeChild(node.querySelector(".spinner"));
      node.classList.remove("loading");
      if (BlockImage.onLoadCallback) {
        BlockImage.onLoadCallback();
      }
    };
    const src = typeof value === "string" ? value : value["src"];
    log(`Image value:`);
    log(value);
    if (src) {
      img.setAttribute("src", this.sanitize(src));
      img.classList.add("image");
    }
    if (value["width"] || value["height"]) {
      img.setAttribute("width", `${value["width"]}px`);
      img.setAttribute("height", `${value["height"]}px`);
    }
    node.setAttribute("contenteditable", false);
    node.classList.add("ql-block-image", "ql-embed", "loading");
    makeSpoilerable(this, node, value);
    addEmbedEditOverlay(this, node);
    node.appendChild(img);

    const spinnerNode = document.createElement("div");
    spinnerNode.classList.add("spinner");
    node.appendChild(spinnerNode);
    if (value["loadPromise"]) {
      (value["loadPromise"] as Promise<string | ArrayBuffer>)
        .then((src) => {
          img.setAttribute("src", this.sanitize(src));
        })
        .catch(() => {
          node.removeChild(node.querySelector(".spinner"));
          node.classList.add("error");
          node.classList.remove("loading");
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
