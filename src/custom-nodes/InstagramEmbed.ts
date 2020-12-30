import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:instagram");

class InstagramEmbed extends Oembed {
  static EMBED_SCRIPT_URL = "https://www.instagram.com/embed.js";
  static LOADING_BACKGROUND_COLOR = "#833AB4";
  static LOADING_TEXT = "Applying filters...";
  static SKIP_EMBED_LOADING = false;
  static FORCE_EMBED = true;

  static blotName = "instagram-embed";
  static tagName = "div";
  static className = "ql-oembed-embed";

  static callEmbedScript() {
    logging(`Checking if instagram embed script has already been loaded...`);
    if (window["instgrm"]?.Embeds) {
      logging(`...found!`);
      setTimeout(() => {
        logging(`Calling process!`);
        // TODO: figure out why it doesn't work without this pause.
        window["instgrm"].Embeds.process();
      }, 200);
      return;
    }
    logging(`...not found!`);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://www.instagram.com/embed.js");
    document.body.appendChild(fileref);
    setTimeout(() => {
      InstagramEmbed.callEmbedScript();
    }, 1000);
  }
  static loadPost(
    node: HTMLDivElement,
    data: {
      html: string;
      url: string;
    }
  ) {
    super.loadPost(node, data);
    InstagramEmbed.callEmbedScript();
  }

  static create(value: { url: string }) {
    const node = super.create(value);
    return node;
  }
}

export default InstagramEmbed;
