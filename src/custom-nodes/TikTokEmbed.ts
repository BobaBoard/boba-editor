import Quill from "quill";
import axios from "axios";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

const ID_EXTRACT_REGEX = /data-video-id="([0-9]+)"/;
const getTikTokEmbedId = (html: string) => {
  const id = html.match(ID_EXTRACT_REGEX)[1];
  return id;
};

const attachObserver = (domNode, tikTokNode) => {
  let newObserver = new MutationObserver((mutations, observer) => {
    if (mutations[0]?.removedNodes[0]?.nodeName == "SECTION") {
      const loadingMessage = domNode.querySelector(".loading-message");
      loadingMessage.parentNode.removeChild(loadingMessage);
      domNode.classList.add("loaded");
      domNode.classList.remove("loading");
      observer.disconnect();
      TikTokEmbed.onLoadCallback();
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
    let tikTokNode = document.createElement("div");
    tikTokNode.classList.add("tiktok-video");
    tikTokNode.innerHTML = `
        <blockquote class="tiktok-embed" cite="${data.url}" data-video-id="${data.id}">
            <section></section>
        </blockquote>`;
    node.dataset.url = data.url;
    node.dataset.id = data.id;
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
        console.log(err);
      });

    return node;
  }

  static create(value: string) {
    let node = super.create();

    node.contentEditable = false;
    node.dataset.rendered = false;
    node.classList.add("tiktok", "loading");
    const loadingMessage = document.createElement("p");
    loadingMessage.innerHTML = "Hello fellow kids, it's TikTok time™";
    loadingMessage.classList.add("loading-message");
    node.appendChild(loadingMessage);

    if (typeof value == "string") {
      return TikTokEmbed.renderFromUrl(node, this.sanitize(value));
    }
    TikTokEmbed.loadVideo(node, value);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    TikTokEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return {
      id: domNode.dataset.id,
      url: domNode.dataset.url,
    };
  }

  static sanitize(url: string) {
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
}

TikTokEmbed.blotName = "tiktok-embed";
TikTokEmbed.tagName = "div";
TikTokEmbed.className = "ql-tiktok-embed";

Icon["tiktok"] = TikTokEmbed.icon();

export default TikTokEmbed;
