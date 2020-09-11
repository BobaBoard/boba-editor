import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
import { addEmbedOverlay, addErrorMessage, addLoadingMessage } from "./utils";
const Link = Quill.import("formats/link");

const logging = require("debug")("bobapost:embeds:oembeds");

const attachObserver = function (this: OEmbed, domNode: HTMLDivElement) {
  let newObserver = new MutationObserver((mutations, observer) => {
    logging(`Mutation occurred in embedded node.`);
    const rootNode = this.getRootNode(mutations);
    if (rootNode) {
      const currentHeight = rootNode.getBoundingClientRect().height;
      logging(`Current height of observed node: ${currentHeight}`);
      observer.disconnect();
      const checkNewHeight = () => {
        logging(
          `New height of observed node: ${
            rootNode.getBoundingClientRect().height
          }`
        );
        if (rootNode.getBoundingClientRect().height != currentHeight) {
          this.onLoadEnd(domNode);
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
class OEmbed extends BlockEmbed {
  static icon() {
    return "";
  }

  static onLoadEnd(domNode: HTMLElement, rootNode?: HTMLElement) {
    const loadingMessage = domNode.querySelector(".loading-message");
    logging(loadingMessage);
    loadingMessage?.parentNode?.removeChild(loadingMessage);
    domNode.classList.add("loaded");
    domNode.classList.remove("loading");
    const oEmbedNode = domNode.querySelector(".embed-node");
    oEmbedNode?.classList.add("loaded");
    oEmbedNode?.classList.remove("loading");
    // Add an extra timeout so the size will have set
    // TODO: yes, I know, this whole thing is brittle.
    setTimeout(() => {
      const embedSizes = rootNode
        ? rootNode.getBoundingClientRect()
        : domNode.getBoundingClientRect();
      domNode.dataset.embedWidth = `${embedSizes.width}`;
      domNode.dataset.embedHeight = `${embedSizes.height}`;
      logging(domNode);
      //domNode.style.height = `${embedSizes.height}px`;
      this.onLoadCallback?.();
    }, 200);
  }

  static getRootNode(mutations: MutationRecord[]): HTMLElement | null {
    return mutations[0]?.addedNodes[0]?.nodeName == "IFRAME"
      ? (mutations[0]?.addedNodes[0] as HTMLElement)
      : null;
  }

  static getOEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadPost(
    node: HTMLDivElement,
    data: {
      html: string;
      url: string;
    }
  ) {
    const oEmbedNode = document.createElement("div");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    oEmbedNode.dataset.url = data.url;
    oEmbedNode.classList.add("embed-node");
    oEmbedNode.classList.add("loading");
    node.dataset.url = data.url;
    node.appendChild(oEmbedNode);
    oEmbedNode.innerHTML = data.html;
    logging(this);
    logging(this.SKIP_LOADING);
    if (!this.SKIP_LOADING) {
      logging(`Attaching loading observer.`);
      attachObserver.call(this, node);
    } else {
      logging(`Finished loading (no observer).`);
      this.onLoadEnd(node);
    }
  }

  static renderError(node: HTMLDivElement, url: string) {
    addErrorMessage(node, {
      message: "The embeds bug strikes again!",
      url,
    });
    this.onLoadEnd(node);
  }

  static renderFromUrl(node: HTMLDivElement, url: string) {
    if (!url) {
      addErrorMessage(node, {
        message: "No valid url found in embed post!",
        url: "#",
      });
      return;
    }

    OEmbed.getOEmbedFromUrl(url)
      .then((data) => {
        if (!data.html) {
          this.renderError(node, url);
          return;
        }
        this.loadPost(node, { html: data.html, url });
      })
      .catch((err) => {
        console.log(err);
      });

    return node;
  }

  static create(value: {
    url: string;
    embedHeight?: string;
    embedWidth?: string;
  }) {
    logging(`Creating oEmbed object with value:`);
    logging(value);
    let node = super.create();
    node.contentEditable = false;
    node.dataset.rendered = false;

    addLoadingMessage(node, {
      color: this.LOADING_BACKGROUND_COLOR,
      message: this.LOADING_TEXT,
      url: value.url,
      width: value.embedWidth,
      height: value.embedHeight,
    });
    addEmbedOverlay(node, {
      onClose: () => {
        this.onRemoveRequest?.(node);
      },
    });

    node.classList.add("ql-embed", "loading");
    if (value.embedHeight && value.embedWidth) {
      const ratio =
        (parseInt(value.embedHeight) / parseInt(value.embedWidth)) * 100;
      logging(ratio);

      node.style.setProperty("--ratio-padding", `${ratio}%`);
    }
    return this.renderFromUrl(node, this.sanitize(value.url));
  }

  static setOnLoadCallback(callback: () => void) {
    OEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return {
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
}

OEmbed.blotName = "oembed-embed";
OEmbed.tagName = "div";
OEmbed.className = "ql-oembed-embed";

export default OEmbed;
