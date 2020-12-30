import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:reddit");

class RedditEmbed extends Oembed {
  static EMBED_SCRIPT_URL = "https://embed.redditmedia.com/widgets/platform.js";
  static LOADING_BACKGROUND_COLOR = "#FF5700";
  static LOADING_TEXT = "Thanks for the embed, kind stranger.";
  static SKIP_EMBED_LOADING = false;
  static FORCE_EMBED = true;

  static blotName = "reddit-embed";
  static tagName = "div";
  static className = "ql-oembed-embed";

  static getRootNode(mutations: MutationRecord[]) {
    logging(mutations[0].addedNodes[0]);
    return mutations[0].addedNodes[0] as HTMLElement;
  }

  static callEmbedScript() {
    const fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", RedditEmbed.EMBED_SCRIPT_URL);
    document.body.appendChild(fileref);
  }

  static create(value: { url: string }) {
    logging(value);
    const node = super.create(value);
    RedditEmbed.callEmbedScript();
    return node;
  }
}

export default RedditEmbed;
