import Quill, { BoundsStatic, DeltaOperation } from "quill";
let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
}

// Checks whether the editor selection is currently on an empty
// line and returns the line boundaries in the affermative case.
export const detectNewLine = (editor: Quill): BoundsStatic | null => {
  // Must focus on editor to get selection
  //editor.focus();
  if (!editor.getSelection()) {
    return null;
  }
  // @ts-ignore
  const [line, _unused] = editor.getLine((editor.getSelection() as any).index);

  if (line.cache && line.cache.length === 1) {
    const bounds = editor.getBounds((editor.getSelection() as any).index);
    return bounds;
  }
  return null;
};

export const withKeyboardSubmitHandler = (
  quillKeyboardConfig: any,
  handler: () => void
) => {
  const Keyboard = QuillModule.import("modules/keyboard") as any;
  // TODO: at some point submit a PR to Quill to allow to
  // bind this after configuration and clean this up.
  quillKeyboardConfig.bindings["submit"] = {
    key: Keyboard.keys.ENTER,
    shortKey: true,
    shiftKey: false,
    handler,
  };
};

export const withNoLinebreakHandler = (quillKeyboardConfig: any) => {
  const Keyboard = QuillModule.import("modules/keyboard") as any;
  // TODO: at some point submit a PR to Quill to allow to
  // bind this after configuration and clean this up.
  quillKeyboardConfig.bindings["noLinebreak"] = {
    key: Keyboard.keys.ENTER,
    shiftKey: null,
    shortKey: false,
    // Simply returning false will prevent the new line character
    handler: () => false,
  };
};

export const removeLineBreaksFromPaste = (pasteEvent: React.ClipboardEvent) => {
  const paste = (pasteEvent.clipboardData || pasteEvent.clipboardData).getData(
    "text"
  );
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    return false;
  }
  selection.deleteFromDocument();
  selection
    .getRangeAt(0)
    .insertNode(document.createTextNode(paste.replace(/(\r\n|\n|\r)/gm, " ")));
  (window.getSelection() as any).collapseToEnd();
  pasteEvent.preventDefault();

  return true;
};

const imageNodeNames = ["image", "block-image"];
export const getAllImages = (delta: DeltaOperation[]) => {
  const images: string[] = [];
  delta.forEach((deltaOp) => {
    imageNodeNames.forEach((imageNode) => {
      if (deltaOp.insert && deltaOp.insert[imageNode]) {
        images.push(deltaOp.insert[imageNode]);
      }
    });
  });
  return images;
};

export const replaceImages = (
  delta: DeltaOperation[],
  replacements: { [key: string]: string }
) => {
  delta.forEach((deltaOp) => {
    imageNodeNames.forEach((imageNode) => {
      if (
        deltaOp.insert &&
        deltaOp.insert[imageNode] &&
        replacements[deltaOp.insert[imageNode]]
      ) {
        deltaOp.insert[imageNode] = replacements[deltaOp.insert[imageNode]];
      }
    });
  });
};
