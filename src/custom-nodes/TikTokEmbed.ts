import Quill from "quill";
import axios from "axios";

import { addEmbedEditOverlay, addLoadingMessage } from "./utils";
import { EditorContextProps } from "../Editor";

const logging = require("debug")("bobapost:embeds:tiktok");

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

const ID_EXTRACT_REGEX = /data-video-id="([0-9]+)"/;
const getTikTokEmbedId = (html: string) => {
  const id = html.match(ID_EXTRACT_REGEX)?.[1];
  return id || "";
};

const MAX_TRIES = 100;

const attachObserver = (
  domNode: HTMLDivElement,
  tikTokNode: HTMLDivElement
) => {
  let newObserver = new MutationObserver((mutations, observer) => {
    if (mutations[0]?.removedNodes[0]?.nodeName == "SECTION") {
      const loadingMessage = domNode.querySelector(".loading-message");
      loadingMessage?.parentNode?.removeChild(loadingMessage);
      const iframe = tikTokNode.querySelector("iframe") as HTMLIFrameElement;
      // Add an extra timeout so the size will have set
      let tries = 0;
      const checkNewHeight = () => {
        if (iframe.getBoundingClientRect().height > 1) {
          domNode.classList.add("loaded");
          domNode.classList.remove("loading");
          tikTokNode.style.position = "relative";
          tikTokNode.style.left = "0";
          logging(tikTokNode);
          const embedSizes = iframe.getBoundingClientRect();
          domNode.dataset.embedWidth = `${embedSizes.width}`;
          domNode.dataset.embedHeight = `${embedSizes.height}`;
          TikTokEmbed.onLoadCallback();
          // TODO: figure out why TikTok embed caching doesn't work
          // (It briefly appears, then disappears immediately.)
          // TikTokEmbed.cache?.set(domNode.dataset.url!, domNode);
          return;
        }
        tries++;
        if (tries < MAX_TRIES) {
          setTimeout(checkNewHeight, 100);
        }
      };
      setTimeout(checkNewHeight, 100);
      observer.disconnect();
    }
  });
  newObserver.observe(tikTokNode, {
    subtree: true,
    childList: true,
  });
};

/**
 * TikTokEmbed represents a TikTok video embedded into the editor.
 */
class TikTokEmbed extends BlockEmbed {
  static embedOptions = {
    align: "center",
  };

  static icon() {
    return "";
  }
  static cache: EditorContextProps["cache"] | undefined;

  static onLoadCallback = () => {};

  static getTikTokEmbedFromUrl = (url: any): Promise<any> => {
    return axios.get(`https://www.tiktok.com/oembed?url=${url}`);
  };

  static loadVideo(
    node: HTMLDivElement,
    data: {
      url: string;
      id: string;
    }
  ) {
    addLoadingMessage(node, {
      message: "Hello fellow kids, it's TikTok time™",
      url: data.url,
    });
    let tikTokNode = document.createElement("div");
    tikTokNode.classList.add("tiktok-video");
    tikTokNode.innerHTML = `
        <blockquote class="tiktok-embed" cite="${data.url}" data-video-id="${data.id}">
            <section></section>
        </blockquote>`;
    node.dataset.url = data.url;
    node.dataset.id = data.id;
    addEmbedEditOverlay(this, node);
    tikTokNode.style.position = "absolute";
    tikTokNode.style.left = `-10000px`;
    node.appendChild(tikTokNode);

    attachObserver(node, tikTokNode);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://www.tiktok.com/embed.js");
    document.body.appendChild(fileref);
  }

  static renderFromUrl(node: HTMLDivElement, url: string) {
    if (!url) {
      // TODO: make a decent error here
      return;
    }

    TikTokEmbed.getTikTokEmbedFromUrl(url)
      .then((res) => {
        TikTokEmbed.loadVideo(node, {
          url,
          id: getTikTokEmbedId(res.data.html),
        });
      })
      .catch((err) => {
        logging(err);
      });

    return node;
  }

  static create(
    value:
      | string
      | {
          url: string;
          id: string;
        }
  ) {
    let node = super.create();

    node.contentEditable = false;
    node.dataset.rendered = false;
    node.classList.add("ql-embed", "tiktok", "loading");

    if (typeof value == "string") {
      addLoadingMessage(node, {
        message: "Hello fellow kids, it's TikTok time™",
        url: value,
      });
      return TikTokEmbed.renderFromUrl(node, this.sanitize(value));
    }

    if (TikTokEmbed.cache?.has(value.url)) {
      return TikTokEmbed.cache.get(value.url);
    }
    TikTokEmbed.loadVideo(node, value);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    TikTokEmbed.onLoadCallback = callback;
  }
  static setCache(cache: EditorContextProps["cache"]) {
    TikTokEmbed.cache = cache;
  }

  static value(domNode: HTMLDivElement) {
    return {
      id: domNode.dataset.id,
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

  static blotName = "tiktok-embed";
  static tagName = "div";
  static className = "ql-tiktok-embed";
}

Icon["tiktok"] = TikTokEmbed.icon();

export default TikTokEmbed;
