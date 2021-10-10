import Editor, { EditorContext } from "./Editor";
import {
  getAllImages,
  removeTrailingWhitespace,
  replaceImages,
} from "./quillUtils";

import type { EditorHandler } from "./Editor";
import { getDeltaSummary } from "./semanticUtils";

export {
  getAllImages,
  replaceImages,
  removeTrailingWhitespace,
  getDeltaSummary,
  EditorContext,
};
export default Editor;
export type { EditorHandler };
