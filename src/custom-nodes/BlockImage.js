import Quill from "quill";
import { addEmbedOverlay } from "./utils";

const Image = Quill.import("formats/image");
const BlockEmbed = Quill.import("blots/block/embed");
const Icon = Quill.import("ui/icons");

/**
 * BlockImage is a block node (as opposed to inline) containing a
 * single image. Unlike the classic image type, the block image
 * will take the whole line by default.
 */
class BlockImage extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const img = document.createElement("IMG");
    if (BlockImage.onLoadCallback) {
      img.onload = () => {
        BlockImage.onLoadCallback();
      };
    }
    img.setAttribute("src", this.sanitize(value));
    node.setAttribute("contenteditable", false);
    node.classList.add("ql-block-image");
    node.appendChild(addEmbedOverlay(img));
    return node;
  }

  static sanitize(src) {
    return Image.sanitize(src);
  }

  static setOnLoadCallback(callback) {
    BlockImage.onLoadCallback = callback;
  }

  static value(domNode) {
    const img = domNode.querySelector("img");
    if (!img) {
      return null;
    }
    return img.getAttribute("src");
  }
}

BlockImage.blotName = "block-image";
BlockImage.tagName = "DIV";

Icon["block-image"] = Quill.import("ui/icons")["image"];

export default BlockImage;
