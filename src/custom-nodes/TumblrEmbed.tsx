import { EmbedValue, TumblrEmbedValue } from "../config";
import { addErrorMessage, addLoadingMessage, makeSpoilerable } from "./utils";

import DOMPurify from "dompurify";
import { EditorContextProps } from "../Editor";
import Quill from "quill";
import { addEmbedEditOverlay } from "./utils/embed-overlay";

const logging = require("debug")("bobapost:embeds:tumblt");

const BlockEmbed = Quill.import("blots/block/embed");
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
          const loadingMessage =
            destinationNode.querySelector(".loading-message");
          loadingMessage?.parentNode?.removeChild(loadingMessage);
          destinationNode.classList.add("loaded");
          destinationNode.classList.remove("loading");
          domNode.parentNode?.removeChild(domNode);
          destinationNode.appendChild(
            domNode.querySelector("iframe") as HTMLIFrameElement
          );
          TumblrEmbed.cache?.set(
            TumblrEmbed.getHashForCache(TumblrEmbed.value(destinationNode)),
            destinationNode
          );
          // Add an extra timeout so the size will have set
          setTimeout(() => {
            const embedSizes = tumblrFrame.getBoundingClientRect();
            destinationNode.dataset.embedWidth = `${embedSizes.width}`;
            destinationNode.dataset.embedHeight = `${embedSizes.height}`;
            destinationNode.classList.add("size-loaded");
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
  static cache: EditorContextProps["cache"] | undefined;

  static icon() {
    return "";
  }

  static getOEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadPost(
    node: HTMLDivElement,
    data: {
      href: string;
      did: string;
      url: string;
      spoilers?: boolean | undefined;
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
    attachObserver(containerNode, node);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://assets.tumblr.com/post.js");
    document.body.appendChild(fileref);
  }

  static renderFromUrl(
    node: HTMLDivElement,
    value: { url: string; spoilers: boolean | undefined }
  ) {
    if (!value.url) {
      addErrorMessage(node, {
        message: "No valid url found in Tumblr post!",
        url: "#",
      });
      return;
    }
    TumblrEmbed.getOEmbedFromUrl(value.url)
      .then((data: { html: string; url: string }) => {
        const sanitizedData = DOMPurify.sanitize(data.html);
        const containerNode = document.createElement("div");
        containerNode.innerHTML = sanitizedData;
        const tumblrPost = containerNode.querySelector(".tumblr-post") as
          | HTMLElement
          | undefined;
        if (!tumblrPost) {
          throw new Error("No valid Tumblr embed found in returned HTML");
        }
        const { href, did } = tumblrPost.dataset;
        if (!href || !did) {
          throw new Error("No valid data found in returned Tumblr HTML");
        }
        TumblrEmbed.loadPost(node, {
          href,
          did,
          url: data.url,
          spoilers: value.spoilers,
        });
      })
      .catch((err) => {
        addErrorMessage(node, {
          message: "There was an error loading the post!",
          url: "#",
        });
        const loadingMessage = node.querySelector(".loading-message");
        loadingMessage?.parentNode?.removeChild(loadingMessage);
        node.classList.remove("loading");
        TumblrEmbed.onLoadCallback?.();
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
    if (
      typeof value != "string" &&
      "href" in value &&
      TumblrEmbed.cache?.has(TumblrEmbed.getHashForCache(value))
    ) {
      const cachedNode = TumblrEmbed.cache?.get(
        TumblrEmbed.getHashForCache(value)
      )!;
      cachedNode.setAttribute("data-from-cache", "true");
      makeSpoilerable(this, cachedNode, value);
      return cachedNode;
    }
    addLoadingMessage(node, {
      message: "Loading female-presenting nipples...",
      url,
      width: typeof value == "string" ? "" : value.embedWidth,
      height: typeof value == "string" ? "" : value.embedHeight,
    });
    makeSpoilerable(this, node, value);
    addEmbedEditOverlay(this, node);

    node.classList.add("ql-embed", "loading");
    if (typeof value == "string" || !("href" in value)) {
      return TumblrEmbed.renderFromUrl(node, {
        url: this.sanitize(typeof value == "string" ? value : value.url),
        spoilers:
          typeof value !== "string" && "spoilers" in value
            ? value.spoilers
            : undefined,
      });
    }
    TumblrEmbed.loadPost(node, value);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    TumblrEmbed.onLoadCallback = callback;
  }

  static setCache(cache: EditorContextProps["cache"]) {
    TumblrEmbed.cache = cache;
  }

  optimize(context: any) {
    const rootNode = this.domNode as HTMLElement;
    // If the editor is view-only, and there's no spoilers remove the embeds overlay
    if (rootNode.closest(".editor.view-only")) {
      const embedOverlay = rootNode.querySelector(".embed-overlay");
      if (embedOverlay?.classList.contains("spoilers")) {
        embedOverlay.innerHTML = "";
      } else {
        embedOverlay?.parentElement?.removeChild(embedOverlay);
      }
    }
  }

  static value(domNode: HTMLDivElement) {
    return {
      href: domNode.dataset.href,
      did: domNode.dataset.did,
      url: domNode.dataset.url!,
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

  static getHashForCache(value: EmbedValue) {
    return value.url;
  }

  static blotName = "tumblr-embed";
  static tagName = "div";
  static className = "ql-tumblr-embed";
}

Icon["tumblr"] = TumblrEmbed.icon();

export default TumblrEmbed;
