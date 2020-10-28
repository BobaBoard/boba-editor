import Quill from "quill";

const Break = Quill.import("blots/break");

/**
 * Extends Quill default "break" so it adds "empty" class to paragraphs when
 * there is no text within them. Used with CustomBreak to simulate <br /> vs <p>.
 */
class CustomBreak extends Break {
  static value() {
    return undefined;
  }
  optimize() {
    if (this.prev || this.next) {
      this.parent.domNode?.classList?.remove("empty");
      this.remove();
    } else if (!this.parent.domNode?.classList?.contains("empty")) {
      this.parent.domNode?.classList?.add("empty");
    }
  }

  length() {
    return 0;
  }

  value() {
    return "";
  }
}

export default CustomBreak;
