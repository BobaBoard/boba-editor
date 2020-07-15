// Matches to <em class="alt-italic">...</em>
import Quill from "quill";
import { debug } from "console";

const Inline = Quill.import("blots/inline");

const log = require("debug")("bobapost:styles:spoilers");

export default class InlineSpoilers extends Inline {
  static blotName = "inline-spoilers";
  static tagName = "SPAN";
  static className = "inline-spoilers";

  constructor(domNode) {
    super(domNode);
    domNode.addEventListener("click", () => {
      log(`Clickity click!`);
      domNode.classList.toggle("visible");
    });
  }

  static formats(domNode) {
    log(`Formatting spoilers node.`);
    super.formats(domNode);
    return true;
  }

  optimize(context) {
    super.optimize(context);
    let next = this;
    let adjacentSpoilers = [];
    // Get all consecutive nodes that are also "inline-spoilers"
    while (next?.domNode?.classList?.contains("inline-spoilers")) {
      adjacentSpoilers.push(next);
      next = next.next;
    }
    log(`Found ${adjacentSpoilers.length} adjacent spoiler nodes.`);
    for (let i = 1; i < adjacentSpoilers.length; i++) {
      log(`Merging node ${i + 1}`);
      adjacentSpoilers[i].moveChildren(this);
      adjacentSpoilers[i].remove();
    }
  }
}
