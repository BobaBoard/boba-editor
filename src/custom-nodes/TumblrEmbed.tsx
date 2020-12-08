import { EmbedValue } from "../config";
import Quill from "quill";

const logging = require("debug")("bobapost:embeds:tumblt");

const BlockEmbed = Quill.import("blots/block/embed");
import { addEmbedOverlay, addErrorMessage, addLoadingMessage } from "./utils";
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");
interface TumblrEmbedValue extends EmbedValue {
  href: string;
  did: string;
}

// const logging = require("debug")("bobapost:embeds:tumblr");

const onEmbedLoad = (
  iframeNode: HTMLIFrameElement,
  destinationNode: HTMLDivElement
) => {
  const loadingMessage = destinationNode.querySelector(".loading-message");
  loadingMessage?.parentNode?.removeChild(loadingMessage);
  destinationNode.classList.add("loaded");
  destinationNode.classList.remove("loading");
  TumblrEmbed.onLoadCallback?.();
  return;
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

  static getTumblrEmbedFromUrl = (
    url: any
  ): Promise<{
    href: string;
    did: string;
    url: string;
    embedWidth?: string;
  }> => {
    throw new Error("unimplemented");
  };

  static loadPost(
    node: HTMLDivElement,
    data: {
      href: string;
      did: string;
      url: string;
      embedHeight?: string;
      embedWidth?: string;
    }
  ) {
    // Load this offscreen so there's no jarring re-size.
    const tumblrNode = document.createElement("iframe");
    const loadingNode = document.createElement("div");
    tumblrNode.classList.add("tumblr-post");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    tumblrNode.dataset.href = data.href;
    tumblrNode.dataset.did = data.did;
    tumblrNode.dataset.url = data.url;
    tumblrNode.width = data.embedWidth || "100%";
    // @ts-ignore
    tumblrNode.loading = "lazy";
    node.dataset.href = data.href;
    node.dataset.did = data.did;
    node.dataset.url = data.url;
    const onload = (e: MessageEvent) => {
      if (tumblrNode.contentWindow == e.source && e.data.height) {
        tumblrNode.height = e.data.height;
        node.dataset.embedWidth = `${tumblrNode.width}`;
        node.dataset.embedHeight = `${tumblrNode.height}`;
        loadingNode.removeChild(tumblrNode);
        node.appendChild(tumblrNode);
        document.body.removeChild(loadingNode);
        window.removeEventListener("message", onload);
        window.addEventListener("message", (e) => {
          console.log(e);
        });
        onEmbedLoad(tumblrNode, node);
      }
    };
    window.addEventListener("message", onload);
    loadingNode.appendChild(tumblrNode);
    document.body.appendChild(loadingNode);
    loadingNode.style.position = "absolute";
    loadingNode.style.left = `-10000px`;
    tumblrNode.src = data.href;
    addEmbedOverlay(node, {
      onClose: () => {
        TumblrEmbed.onRemoveRequest?.(node);
      },
    });
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

  static create(value: string | EmbedValue | TumblrEmbedValue) {
    let node = super.create();
    node.contentEditable = false;
    node.dataset.rendered = false;
    const url = typeof value == "string" ? this.sanitize(value) : value.url;

    if (!url) {
      addErrorMessage(node, {
        message: "There's no url for this Tumblr embed!",
        url: "#error",
      });
      return node;
    }

    addLoadingMessage(node, {
      message: "Loading female-presenting nipples...",
      url,
      width: typeof value == "string" ? "" : value.embedWidth,
      height: typeof value == "string" ? "" : value.embedHeight,
    });

    node.classList.add("ql-embed", "loading");
    if (typeof value == "string" || !("href" in value)) {
      return TumblrEmbed.renderFromUrl(
        node,
        this.sanitize(typeof value == "string" ? value : value.url)
      );
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
    if (url?.indexOf("?") !== -1) {
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
