// import { addErrorMessage, addLoadingMessage, makeSpoilerable } from "./utils";

// import { EditorContextProps } from "../Editor";
import Quill from "quill";
import React from "react";
import ReactDOM from "react-dom";
import TweetEmbed from "./components/Twitter";
// import { addEmbedEditOverlay } from "./utils/embed-overlay";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

// const logging = require("debug")("bobapost:embeds:oembeds");

class TweetEmbed2 extends BlockEmbed {
  static icon() {
    return "";
  }

  static create(value: any) {
    let node = super.create();
    ReactDOM.render(React.createElement(TweetEmbed, { value }), node);
    return node;
  }

  static value(domNode: HTMLDivElement) {
    const child = domNode.firstElementChild as HTMLElement;
    return {
      url: child?.dataset.url!,
      id: child?.dataset.id,
      embedWidth: child?.dataset.embedWidth,
      embedHeight: child?.dataset.embedHeight,
    };
  }

  static sanitize(url: string) {
    if (!url) {
      return "";
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
  static blotName = "tweet";
  static tagName = "div";
  static className = "ql-tweet";
}

export default TweetEmbed2;
