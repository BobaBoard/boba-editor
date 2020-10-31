import Quill from "quill";

const Text = Quill.import("blots/text");

const getParentParagraph = (node: any) => {
  let current = node;
  while (
    current?.parent?.domNode?.tagName &&
    current.domNode?.tagName !== "P"
  ) {
    current = current.parent;
  }
  return current?.domNode;
};

/**
 * Extends Quill default text so it removes "empty" from paragraph breaks when
 * there is text within them. Used with CustomBreak to simulate <br /> vs <p>.
 */
class CustomText extends Text {
  optimize(context: any) {
    const paragraphParent = getParentParagraph(this);
    if (this.text.length > 0 && paragraphParent?.classList.contains("empty")) {
      paragraphParent.classList.remove("empty");
    }
    super.optimize(context);
  }
}

export default CustomText;
