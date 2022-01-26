import Oembed from "./OEmbedBase";

const logging = require("debug")("bobapost:embeds:pixiv");

class PixivEmbed extends Oembed {
  static LOADING_BACKGROUND_COLOR = "#0096fa";
  static LOADING_TEXT = "行っ・・・行っちゃう!";

  static blotName = "pixiv-embed";
  static tagName = "div";
  static className = "ql-pixiv-embed";

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

export default PixivEmbed;
