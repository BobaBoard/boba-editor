import { addErrorMessage, addLoadingMessage, makeSpoilerable } from "./utils";

import { EditorContextProps } from "../Editor";
import { EmbedValue } from "../config";
import Quill from "quill";
import { addEmbedEditOverlay } from "./utils/embed-overlay";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");


const logging = require("debug")("bobapost:embeds:youtube");

const extractYouTubeUrl = (url: URL) => {
  let videoUrl = "";
  if (url.href.startsWith("https://www.youtube.com/embed/")) {
    videoUrl = url.href;
  } else if (url.href.startsWith("https://youtu.be/")) {
    videoUrl = `https://www.youtube.com/embed/${url.pathname.substring(1)}`;
  } else {
    videoUrl = `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
  }

  if (url.searchParams.has("t")) {
    videoUrl += `?start=${url.searchParams.get("t")}`;
  }

  return videoUrl;
};

/**
 * YouTubeEmbed represents a youtube video embedded into the editor.
 */
class YouTubeEmbed extends BlockEmbed {
  static embedOptions = {
    align: "center",
  };

  static cache: EditorContextProps["cache"] | undefined;

  static create(value: string | EmbedValue) {
    let node = super.create();
    const url = new URL(typeof value === "string" ? value : value.url);
    logging(`Creating new youtube video embed with url ${url}`);
    if (!url) {
      addErrorMessage(node, {
        message: "There's no url for this video!",
        url: "#",
      });
      return;
    }
    let videoUrl = extractYouTubeUrl(url);
    // TODO: figure out why timestamp doesn't work

    if (YouTubeEmbed.cache?.has(videoUrl)) {
      return YouTubeEmbed.cache.get(videoUrl);
    }

    logging(`Embed url ${videoUrl}`);
    const embedFrame = document.createElement("iframe");
    embedFrame.setAttribute("src", this.sanitize(videoUrl));
    embedFrame.frameBorder = "0";
    embedFrame.allow =
      "accelerometer; encrypted-media; gyroscope; picture-in-picture";
    embedFrame.allowFullscreen = true;

    addLoadingMessage(node, {
      message: "Loading Influencers-birthing Machine...",
      url: url.toString(),
    });
    makeSpoilerable(this, node, value);
    addEmbedEditOverlay(this, node);
    /*
     * Be gay, do CSS crimes:
     * https://www.h3xed.com/web-development/how-to-make-a-responsive-100-width-youtube-iframe-embed?fbclid=IwAR3CtIZZNP7Kx8ID-l1eoZAlIZ9eUxPRLmQ1yDsU7N0OAAotBAp4w7XHqps
     */
    node.style.position = "relative";
    node.style.width = "100%";
    node.style.height = "0";
    node.style.paddingBottom = "56.25%";

    node.contentEditable = "false";
    node.classList.add("ql-embed", "youtube", "loading");
    node.appendChild(embedFrame);

    embedFrame.onload = () => {
      node.classList.remove("loading");
      YouTubeEmbed.onLoadCallback?.();
      const loadingNode: HTMLDivElement =
        node.querySelector(".loading-message");
      if (loadingNode) {
        node.removeChild(loadingNode);
      }
      YouTubeEmbed.cache?.set(videoUrl, node);
    };

    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    // TODO: implement this
    YouTubeEmbed.onLoadCallback = callback;
  }

  static setCache(cache: EditorContextProps["cache"]) {
    YouTubeEmbed.cache = cache;
  }

  static value(domNode: HTMLDivElement) {
    return { url: domNode.querySelector("iframe")?.src };
  }

  static sanitize(url: string) {
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static blotName = "youtube-video";
  static tagName = "div";
  static className = "ql-youtube-video";
}

export default YouTubeEmbed;
