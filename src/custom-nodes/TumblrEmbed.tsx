import { EmbedValue } from "../config";
import Quill from "quill";

const logging = require("debug")("bobapost:embeds:tumblt");

const BlockEmbed = Quill.import("blots/block/embed");
import debounce from "debounce";
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

const loadTumblrEmbedOffscreen = (data: {
  embedSrc: string;
  embedWidth: string;
  onLoad: (size: {
    height: string;
    width: string;
    iframeNode: HTMLIFrameElement;
  }) => void;
}) => {
  // Load this offscreen so there's no jarring re-size.
  const iframeNode = document.createElement("iframe");
  const loadingNode = document.createElement("div");
  iframeNode.classList.add("tumblr-post");
  iframeNode.width = data.embedWidth;
  const onload = (e: MessageEvent) => {
    if (iframeNode.contentWindow == e.source && e.data.height) {
      logging(`Tumblr height callback received. Height: ${e.data.height}`);
      loadingNode.removeChild(iframeNode);
      window.removeEventListener("message", onload);
      data.onLoad({
        width: data.embedWidth,
        height: e.data.height,
        iframeNode: iframeNode,
      });
      document.body.removeChild(loadingNode);
    }
  };
  window.addEventListener("message", onload);
  loadingNode.appendChild(iframeNode);
  document.body.appendChild(loadingNode);
  loadingNode.style.position = "absolute";
  loadingNode.style.left = `-10000px`;
  iframeNode.src = data.embedSrc;
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
      embedWidth?: string;
      embedHeight?: string;
      fromServer: boolean;
    }
  ) {
    node.dataset.href = data.href;
    node.dataset.did = data.did;
    node.dataset.url = data.url;
    if (data.fromServer) {
      loadTumblrEmbedOffscreen({
        embedSrc: data.href,
        embedWidth: data.embedWidth || "800",
        onLoad: ({ width, height }) => {
          node.dataset.embedWidth = width;
          node.dataset.embedHeight = height;
        },
      });
    }
    const containerWidth =
      "" + this.getEditorReference().getBoundingClientRect().width;
    let currentWidth = containerWidth;
    loadTumblrEmbedOffscreen({
      embedSrc: data.href,
      embedWidth: containerWidth,
      onLoad: ({ height, iframeNode }) => {
        const iframeContainer = document.createElement("div");
        iframeContainer.classList.add("tumblr-post");
        iframeContainer.style.height = height + "px";
        iframeContainer.appendChild(iframeNode);
        iframeNode.style.position = "absolute";
        iframeNode.style.overflow = "hidden";
        iframeNode.height = height;
        node.appendChild(iframeContainer);
        onEmbedLoad(iframeNode, node);
        const resizeObserver = new ResizeObserver(debounce(onResize, 300));
        resizeObserver.observe(iframeContainer);
      },
    });
    const onResize = (entries: ResizeObserverEntry[]) => {
      const hasChangedWidth = currentWidth != "" + entries[0].contentRect.width;
      logging(
        `Tumblr width changed? ${hasChangedWidth} with width ${entries[0].contentRect.width} and height ${entries[0].contentRect.height}.`
      );
      if (hasChangedWidth) {
        currentWidth = "" + entries[0].contentRect.width;
        loadTumblrEmbedOffscreen({
          embedSrc: data.href,
          embedWidth: "" + entries[0].contentRect.width,
          onLoad: ({ height }) => {
            const hasScrollbarBeforeChange =
              document.documentElement.scrollHeight >
              document.documentElement.clientHeight;
            // @ts-ignore
            entries[0].target.style.height = height + "px";
            // @ts-ignore
            entries[0].target.querySelector("iframe").width = currentWidth;
            // @ts-ignore
            entries[0].target.querySelector("iframe").height = height;
            const hasScrollbarAfterChange =
              document.documentElement.scrollHeight >
              document.documentElement.clientHeight;
            if (hasScrollbarBeforeChange != hasScrollbarAfterChange) {
              // Adding and removing scrollbars causes a problem with infinite looping.
              logging("Change in scrollbars visibility!");
            }
          },
        });
      }
    };
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
        TumblrEmbed.loadPost(node, { ...data, fromServer: true });
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
    TumblrEmbed.loadPost(node, { ...value, fromServer: false });
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
