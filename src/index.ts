import Editor, { EditorHandler } from "./Editor";
import {
  getAllImages,
  replaceImages,
  removeTrailingWhitespace,
} from "./quillUtils";

export const setTumblrEmbedFetcher = (fetcher: (url: string) => any) => {
  if (typeof window !== "undefined") {
    const TumblrEmbed = require("./custom-nodes/TumblrEmbed");
    TumblrEmbed.default.getTumblrEmbedFromUrl = fetcher;
  }
};

export const setOEmbedFetcher = (fetcher: (url: string) => any) => {
  if (typeof window !== "undefined") {
    const OEmbed = require("./custom-nodes/OEmbedBase");
    OEmbed.default.getOEmbedFromUrl = fetcher;
  }
};

export { getAllImages, replaceImages, removeTrailingWhitespace, EditorHandler };
export default Editor;
