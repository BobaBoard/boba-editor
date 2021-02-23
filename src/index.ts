import Editor, { EditorContext } from "./Editor";
import type { EditorHandler } from "./Editor";
import {
  getAllImages,
  replaceImages,
  removeTrailingWhitespace,
} from "./quillUtils";

export { getAllImages, replaceImages, removeTrailingWhitespace, EditorContext };
export default Editor;
export type { EditorHandler };
