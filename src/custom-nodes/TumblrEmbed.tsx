import Quill from "quill";

const logging = require("debug")("bobapost:embeds:tumblt");

const BlockEmbed = Quill.import("blots/block/embed");
import { addEmbedOverlay, addErrorMessage, addLoadingMessage } from "./utils";
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

// const logging = require("debug")("bobapost:embeds:tumblr");

const attachObserver = (
  domNode: HTMLDivElement,
  destinationNode: HTMLDivElement
) => {
  let newObserver = new MutationObserver((mutations, observer) => {
    if (mutations[0]?.addedNodes[0]?.nodeName == "IFRAME") {
      const tumblrFrame = mutations[0]?.addedNodes[0] as HTMLIFrameElement;
      const currentHeight = tumblrFrame.getBoundingClientRect().height;
      observer.disconnect();
      const checkNewHeight = () => {
        if (tumblrFrame.getBoundingClientRect().height != currentHeight) {
          const loadingMessage = destinationNode.querySelector(
            ".loading-message"
          );
          loadingMessage?.parentNode?.removeChild(loadingMessage);
          destinationNode.classList.add("loaded");
          destinationNode.classList.remove("loading");
          domNode.parentNode?.removeChild(domNode);
          destinationNode.appendChild(
            domNode.querySelector("iframe") as HTMLIFrameElement
          );
          // Add an extra timeout so the size will have set
          setTimeout(() => {
            const embedSizes = tumblrFrame.getBoundingClientRect();
            destinationNode.dataset.embedWidth = `${embedSizes.width}`;
            destinationNode.dataset.embedHeight = `${embedSizes.height}`;
            TumblrEmbed.onLoadCallback?.();
          }, 200);
          return;
        }
        setTimeout(checkNewHeight, 100);
      };
      setTimeout(checkNewHeight, 100);
    }
  });
  newObserver.observe(domNode, {
    subtree: true,
    childList: true,
  });
};

/**
 * TumblrEmbed represents a tumblr post embedded into the editor.
 */
class TumblrEmbed extends BlockEmbed {
  static embedOptions = {
    align: "center",
  };

  static icon() {
    return "";
  }

  static getTumblrEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadPost(
    node: HTMLDivElement,
    data: {
      href: string;
      did: string;
      url: string;
    }
  ) {
    const tumblrNode = document.createElement("div");
    const containerNode = document.createElement("div");
    tumblrNode.classList.add("tumblr-post");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    tumblrNode.dataset.href = data.href;
    tumblrNode.dataset.did = data.did;
    tumblrNode.dataset.url = data.url;
    node.dataset.href = data.href;
    node.dataset.did = data.did;
    node.dataset.url = data.url;
    containerNode.appendChild(tumblrNode);
    document.body.appendChild(containerNode);
    containerNode.style.position = "absolute";
    containerNode.style.left = `-10000px`;
    addEmbedOverlay(node, {
      onClose: () => {
        TumblrEmbed.onRemoveRequest?.(node);
      },
    });
    attachObserver(containerNode, node);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://assets.tumblr.com/post.js");
    document.body.appendChild(fileref);
  }

  static renderFromUrl(node: HTMLDivElement, url: string) {
    if (!url) {
      addErrorMessage(node, {
        message: "No valid url found in Tumblr post!",
        url: "#",
      });
      return;
    }

    TumblrEmbed.getTumblrEmbedFromUrl(url)
      .then((data) => {
        TumblrEmbed.loadPost(node, data);
      })
      .catch((err) => {
        logging(err);
      });

    return node;
  }

  static create(value: any) {
    let node = super.create();
    node.contentEditable = false;
    node.dataset.rendered = false;
    const url = typeof value == "string" ? this.sanitize(value) : value.url;

    addLoadingMessage(node, {
      message: "Loading female-presenting nipples...",
      url,
      width: value.embedWidth,
      height: value.embedHeight,
    });

    node.classList.add("ql-embed", "loading");
    if (!value.href || typeof value == "string") {
      return TumblrEmbed.renderFromUrl(node, this.sanitize(value.url || value));
    }
    TumblrEmbed.loadPost(node, value);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    TumblrEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return {
      href: domNode.dataset.href,
      did: domNode.dataset.did,
      url: domNode.dataset.url,
      embedWidth: domNode.dataset.embedWidth,
      embedHeight: domNode.dataset.embedHeight,
    };
  }

  static sanitize(url: string) {
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static blotName = "tumblr-embed";
  static tagName = "div";
  static className = "ql-tumblr-embed";
}

Icon["tumblr"] = TumblrEmbed.icon();

export default TumblrEmbed;
