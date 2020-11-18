import Quill from "quill";

const Image = Quill.import("formats/image");

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
 * Extends Quill default "break" so it adds "empty" class to paragraphs when
 * there is no text within them. Used with CustomBreak to simulate <br /> vs <p>.
 */
class CustomImage extends Image {
  optimize(context: any) {
    const paragraphParent = getParentParagraph(this);
    if (paragraphParent?.classList.contains("empty")) {
      paragraphParent.classList.remove("empty");
    }
    super.optimize(context);
  }
}

export default CustomImage;
