import Editor from "./Editor";
import { getAllImages, replaceImages } from "./quillUtils";

export const setTumblrEmbedFetcher = (fetcher: (url: string) => any) => {
  if (typeof window !== "undefined") {
    const TumblrEmbed = require("./custom-nodes/TumblrEmbed");
    TumblrEmbed.default.getTumblrEmbedFromUrl = fetcher;
  }
};

export { getAllImages, replaceImages };
export default Editor;
