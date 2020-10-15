import Quill, { BoundsStatic, DeltaOperation } from "quill";
let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
}

const logging = require("debug")("bobapost:quillUtils");

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
  logging("Past event detected!");
  const paste = pasteEvent.clipboardData?.getData("text/plain");
  logging("Pasted data:");
  logging(paste);
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
  pasteEvent.stopPropagation();

  return true;
};

const imageNodeNames = ["image", "block-image"];
export const getAllImages = (delta: DeltaOperation[]) => {
  const images: string[] = [];
  delta.forEach((deltaOp) => {
    imageNodeNames.forEach((imageNode) => {
      if (deltaOp.insert && deltaOp.insert[imageNode]) {
        const src = deltaOp.insert[imageNode].src || deltaOp.insert[imageNode];
        images.push(src);
      }
    });
  });
  return images;
};

export const removeTrailingWhitespace = (delta: DeltaOperation[]) => {
  let lastNotEmpty: number | null = null;
  delta.forEach((deltaOp, index) => {
    if (
      typeof deltaOp.insert !== "string" ||
      deltaOp.insert.trim() !== "" ||
      deltaOp.attributes?.list
    ) {
      lastNotEmpty = index;
    }
  });
  const resultDelta =
    !lastNotEmpty || lastNotEmpty == delta.length - 1
      ? delta
      : // Filter out all the empty ops at the end
        delta.filter((op, index) => index <= (lastNotEmpty as number));
  // Remove trailing whitespace from end of last deltaOp, if it's a string
  if (
    typeof resultDelta[resultDelta.length - 1].insert === "string" &&
    !resultDelta[resultDelta.length - 1].attributes
  ) {
    resultDelta[resultDelta.length - 1].insert = resultDelta[
      resultDelta.length - 1
    ].insert.trimRight();
  }
  return resultDelta;
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
        (replacements[deltaOp.insert[imageNode]] ||
          replacements[deltaOp.insert[imageNode].src])
      ) {
        if (deltaOp.insert[imageNode].src) {
          deltaOp.insert[imageNode].src =
            replacements[deltaOp.insert[imageNode].src];
        } else {
          deltaOp.insert[imageNode] = replacements[deltaOp.insert[imageNode]];
        }
      }
    });
  });
};

export const importEmbedModule = (
  moduleName: string,
  callbacks: {
    onLoadCallback: () => void;
    onRemoveRequestCallback: (root: HTMLElement) => void;
  }
) => {
  logging(`Importing module ${moduleName}`);
  const EmbedModule = require(`./custom-nodes/${moduleName}`).default;

  QuillModule.register(`formats/${EmbedModule.blotName}`, EmbedModule, true);

  QuillModule.import(`formats/${EmbedModule.blotName}`).setOnLoadCallback(
    callbacks.onLoadCallback
  );
  QuillModule.import(`formats/${EmbedModule.blotName}`).onRemoveRequest =
    callbacks.onRemoveRequestCallback;
};

export const pasteImageAsBlockEmbed = (
  pasteEvent: ClipboardEvent,
  embedMethod: (img: string | ArrayBuffer) => void
) => {
  logging("Paste event detected! Processing images...");
  let found = false;
  // @ts-ignore
  logging(pasteEvent.clipboardData?.items?.length);
  for (let i = 0; i < (pasteEvent.clipboardData?.items?.length || -1); i++) {
    const item = pasteEvent.clipboardData?.items[i] as DataTransferItem;
    if (item.type.startsWith("image/")) {
      found = true;
      logging(item.kind);
      logging(item.getAsFile());
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          return;
        }
        embedMethod(e.target.result);
      };
      const file = item.getAsFile();
      if (file) {
        reader.readAsDataURL(file);
      }
    }
  }
  if (found) {
    pasteEvent.preventDefault();
    pasteEvent.stopPropagation();
  }
};
