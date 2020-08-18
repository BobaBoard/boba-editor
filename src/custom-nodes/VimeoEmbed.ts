import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:vimeo");

class VimeoEmbed extends Oembed {
  static LOADING_BACKGROUND_COLOR = "#1dbae8";
  static LOADING_TEXT = "Time for the COOLER YouTube...";
  static SKIP_LOADING = true;

  static blotName = "vimeo-embed";
  static tagName = "div";
  static className = "ql-oembed-embed";

  static getRootNode(mutations: MutationRecord[]) {
    logging(mutations[0].addedNodes[0]);
    return mutations[0].addedNodes[0] as HTMLElement;
  }

  static create(value: { url: string }) {
    logging(value);
    const node = super.create(value);
    return node;
  }
}

export default VimeoEmbed;
