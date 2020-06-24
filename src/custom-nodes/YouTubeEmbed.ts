import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

import { addEmbedOverlay } from "./utils";

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
    if (!url) {
      // TODO: make a decent error here
      return;
    }
    let videoUrl;
    // TODO: add timestamp
    if (url.href.startsWith("https://www.youtube.com/embed/")) {
      videoUrl = value;
    } else if (url.href.startsWith("https://youtu.be/")) {
      videoUrl = `https://www.youtube.com/embed/${url.pathname.substring(1)}`;
    } else {
      videoUrl = `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
    }
    const embedFrame = document.createElement("iframe");
    embedFrame.setAttribute("src", this.sanitize(videoUrl));
    embedFrame.style.position = "absolute";
    embedFrame.style.top = "0";
    embedFrame.style.left = "0";
    embedFrame.style.width = "100%";
    embedFrame.style.height = "100%";
    embedFrame.frameBorder = "0";
    embedFrame.allow =
      "accelerometer; encrypted-media; gyroscope; picture-in-picture";
    embedFrame.allowFullscreen = true;

    const root = addEmbedOverlay(embedFrame, {
      onClose: () => {
        YouTubeEmbed.onRemoveRequest?.(node);
      },
    });
    /*
     * Be gay, do CSS crimes:
     * https://www.h3xed.com/web-development/how-to-make-a-responsive-100-width-youtube-iframe-embed?fbclid=IwAR3CtIZZNP7Kx8ID-l1eoZAlIZ9eUxPRLmQ1yDsU7N0OAAotBAp4w7XHqps
     */
    root.style.position = "relative";
    root.style.width = "100%";
    root.style.height = "0";
    root.style.paddingBottom = "56.25%";

    root.contentEditable = "false";
    node.classList.add("ql-embed", "youtube-embed", "loading");
    node.appendChild(root);

    embedFrame.onload = () => {
      node.classList.remove("loading");
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
}

YouTubeEmbed.blotName = "youtube-video";
YouTubeEmbed.tagName = "div";
YouTubeEmbed.className = "ql-youtube-video";

export default YouTubeEmbed;
