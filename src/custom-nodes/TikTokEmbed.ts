import Quill from "quill";
import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:tiktok");

const Icon = Quill.import("ui/icons");

class TikTokEmbed extends Oembed {
  static EMBED_SCRIPT_URL = "https://www.tiktok.com/embed.js";
  static LOADING_TEXT = "Hello fellow kids, it's TikTok time™";
  static LOADING_BACKGROUND_COLOR = "aquamarine";
  static SKIP_EMBED_LOADING = false;
  static SKIP_CACHE = true;

  static ATTEMPTS = 10;

  static blotName = "tiktok-embed";
  static tagName = "div";
  static className = "ql-tiktok-embed";

  static getRootNode(mutations: MutationRecord[]) {
    logging(mutations[0].addedNodes[0]);
    return mutations[0].addedNodes[0] as HTMLElement;
  }

  static onLoadEnd = (node: HTMLElement) => {
    // if (window["tiktokEmbed"]) {
    //   window["tiktokEmbed"].lib.render([node?.querySelector("blockquote")]);
    // } else {
    //   setTimeout(() => {
    //     TikTokEmbed.ATTEMPTS -= 1;
    //     if (TikTokEmbed.ATTEMPTS > 0) {
    //       TikTokEmbed.onLoadEnd(node);
    //     }
    //   }, 200);
    // }

    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://www.tiktok.com/embed.js");
    document.body.appendChild(fileref);
  };

  static create(value: { url: string }) {
    logging(value);
    const node = super.create(value);

    return node;
  }
}

Icon["tiktok"] = TikTokEmbed.icon();
export default TikTokEmbed;
