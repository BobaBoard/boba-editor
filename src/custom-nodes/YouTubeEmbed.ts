import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

/**
 * YouTubeEmbed represents a youtube video embedded into the editor.
 */
class YouTubeEmbed extends BlockEmbed {
  static embedOptions = {
    align: "center",
  };

  static icon() {
    // TODO: maybe inlining this isn't the greatest idea, but it works.
    return '<svg viewBox="0 0 275 275" xmlns="http://www.w3.org/2000/svg"><path d="M91.1 239c94.4 0 146-78 146-145.8 0-2.3 0-4.5-.2-6.7 10-7.2 18.7-16.2 25.6-26.5-9.4 4.1-19.3 6.8-29.5 8a51.5 51.5 0 0 0 22.6-28.3c-10 6-21 10.2-32.6 12.4A51.3 51.3 0 0 0 135.6 99C94.4 96.9 56 77.4 30 45.3a51.3 51.3 0 0 0 15.9 68.5 51 51 0 0 1-23.3-6.4v.6a51.3 51.3 0 0 0 41.1 50.3c-7.5 2-15.4 2.4-23.1.9a51.3 51.3 0 0 0 48 35.6 103 103 0 0 1-76 21.3c23.5 15 50.7 23 78.6 23" class="ql-fill" fill-rule="nonzero"/></svg>';
  }

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
    /*
     * Be gay, do CSS crimes:
     * https://www.h3xed.com/web-development/how-to-make-a-responsive-100-width-youtube-iframe-embed?fbclid=IwAR3CtIZZNP7Kx8ID-l1eoZAlIZ9eUxPRLmQ1yDsU7N0OAAotBAp4w7XHqps
     */
    node.style.position = "relative";
    node.style.width = "100%";
    node.style.height = "0";
    node.style.paddingBottom = "56.25%";
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
    node.contentEditable = false;
    node.classList.add("youtube-embed");
    node.appendChild(embedFrame);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    // TODO: implement this
    YouTubeEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    console.log(domNode.getElementsByTagName("iframe")[0]);
    return domNode.getElementsByTagName("iframe")[0].src;
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

Icon["youtube"] = YouTubeEmbed.icon();

export default YouTubeEmbed;
