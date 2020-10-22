import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

import { addEmbedOverlay, addErrorMessage, addLoadingMessage } from "./utils";

const logging = require("debug")("bobapost:embeds:youtube");

/**
 * YouTubeEmbed represents a youtube video embedded into the editor.
 */
class YouTubeEmbed extends BlockEmbed {
  static embedOptions = {
    align: "center",
  };

  static create(value: string) {
    let node = super.create();
    const url = new URL(value);
    logging(`Creating new youtube video embed with url ${url}`);
    if (!url) {
      addErrorMessage(node, {
        message: "There's no url for this video!",
        url: "#",
      });
      return;
    }
    let videoUrl;
    // TODO: figure out why timestamp doesn't work
    if (url.href.startsWith("https://www.youtube.com/embed/")) {
      videoUrl = value;
    } else if (url.href.startsWith("https://youtu.be/")) {
      videoUrl = `https://www.youtube.com/embed/${url.pathname.substring(
        1
      )}?start=${url.searchParams.get("t")}`;
    } else {
      videoUrl = `https://www.youtube.com/embed/${url.searchParams.get(
        "v"
      )}?start=${url.searchParams.get("t")}`;
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
    addEmbedOverlay(node, {
      onClose: () => {
        YouTubeEmbed.onRemoveRequest?.(node);
      },
    });
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
      node.removeChild(
        node.querySelector(".loading-message") as HTMLDivElement
      );
    };

    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    // TODO: implement this
    YouTubeEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return domNode.querySelector("iframe")?.src;
  }

  static sanitize(url: string) {
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static blotName = "youtube-video";
  static tagName = "div";
  static className = "ql-youtube-video";
}

export default YouTubeEmbed;
