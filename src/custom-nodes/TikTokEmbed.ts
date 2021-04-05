import Quill from "quill";
import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:tiktok");

const Icon = Quill.import("ui/icons");

class TikTokEmbed extends Oembed {
  static EMBED_SCRIPT_URL = "https://www.tiktok.com/embed.js";
  static LOADING_TEXT = "Hello fellow kids, it's TikTok time™";
  static LOADING_BACKGROUND_COLOR = "aquamarine";
  static SKIP_EMBED_LOADING = false;
  static FORCE_EMBED = true;
  static SKIP_CACHE = true;

  static ATTEMPTS = 10;

  static blotName = "tiktok-embed";
  static tagName = "div";
  static className = "ql-tiktok-embed";

  static getRootNode(mutations: MutationRecord[]) {
    logging(mutations[0].addedNodes[0]);
    return mutations[0].addedNodes[0] as HTMLElement;
  }

  static onAfterAttach = (node: HTMLElement, oEmbedNode: HTMLElement) => {
    const scriptNode = oEmbedNode.querySelector("script");
    // Remove script node since we don't need it anyway, and simply use what's already in window.
    scriptNode?.parentElement?.removeChild(scriptNode);
    if (window["tiktokEmbed"]) {
      window["tiktokEmbed"].lib.render([node?.querySelector("blockquote")]);
    } else {
      setTimeout(() => {
        TikTokEmbed.ATTEMPTS -= 1;
        if (TikTokEmbed.ATTEMPTS > 0) {
          TikTokEmbed.onLoadEnd(node, oEmbedNode);
        }
      }, 200);
    }
  };

  static create(value: { url: string }) {
    logging(value);
    const node = super.create(value);
    return node;
  }
}

Icon["tiktok"] = TikTokEmbed.icon();
export default TikTokEmbed;
