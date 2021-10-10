import type { DeltaOperation } from "quill";

// TODO: this shouldn't be hardcoded here. Find the right place.
export const SPOILERS_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fadmin%2Fspoilers.png?alt=media&token=a343aee0-e90f-4379-8d41-1cac1f65f7ee";

const extractText = (ops: DeltaOperation[]) => {
  return ops
    .map((op) => {
      if (typeof op.insert !== "string") {
        return "";
      }
      if (op.attributes?.["inline-spoilers"]) {
        return "█".repeat(op.insert.length);
      }
      return op.insert;
    })
    .join("");
};

const extractImages = (ops: DeltaOperation[]) => {
  return ops
    .filter((op: any) => op.insert["block-image"]?.src)
    .map((op) => {
      if (op.insert["block-image"].spoilers === true) {
        return SPOILERS_IMAGE;
      }
      return op.insert["block-image"].src;
    });
};

const extractTitle = (ops: DeltaOperation[]) => {
  // The title is a line formatting operation (see: https://bobadocs.netlify.app/docs/engineering/boba-editor/the-delta-format#line-formatting).
  // This means we need to find the operation that has a header attribute,
  // and then reverse course until we find the previous \n.

  const headerIndex = ops.findIndex(
    (op: DeltaOperation) =>
      typeof op?.insert === "string" && op.attributes?.["header"]
  );
  if (headerIndex == -1) {
    return undefined;
  }

  const textToTitle = extractText(ops.slice(0, headerIndex));
  // We extract the text up to the last title
  return textToTitle?.substring(textToTitle.lastIndexOf("\n") + 1);
};

export const getDeltaSummary = (
  initialText: DeltaOperation[] | { ops: DeltaOperation[] }
) => {
  const actualDelta = "ops" in initialText ? initialText.ops : initialText;

  return {
    title: extractTitle(actualDelta),
    images: extractImages(actualDelta),
    text: extractText(actualDelta),
  };
};
