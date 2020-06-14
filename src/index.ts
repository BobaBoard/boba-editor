import Editor from "./Editor";
import { getAllImages, replaceImages } from "./quillUtils";

export const setTumblrEmbedFetcher = (fetcher: (url: string) => any) => {
  console.log("entering!");
  if (typeof window !== "undefined") {
    const TumblrEmbed = require("./custom-nodes/TumblrEmbed");
    console.log(TumblrEmbed);
    TumblrEmbed.default.getTumblrEmbedFromUrl = fetcher;
    console.log("set!");
  }
};

export { getAllImages, replaceImages };
export default Editor;
