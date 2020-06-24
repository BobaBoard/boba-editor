import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
import { addEmbedOverlay } from "./utils";
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

const attachObserver = (domNode: HTMLDivElement) => {
  let newObserver = new MutationObserver((mutations, observer) => {
    if (mutations[0]?.addedNodes[0]?.nodeName == "IFRAME") {
      const tumblrFrame = mutations[0]?.addedNodes[0] as HTMLIFrameElement;
      const currentHeight = tumblrFrame.getBoundingClientRect().height;
      observer.disconnect();
      const checkNewHeight = () => {
        if (tumblrFrame.getBoundingClientRect().height != currentHeight) {
          const loadingMessage = domNode.querySelector(".loading-message");
          loadingMessage?.parentNode?.removeChild(loadingMessage);
          domNode.classList.add("loaded");
          domNode.classList.remove("loading");
          // Add an extra timeout so the size will have set
          setTimeout(() => {
            const embedSizes = tumblrFrame.getBoundingClientRect();
            domNode.dataset.embedWidth = `${embedSizes.width}`;
            domNode.dataset.embedHeight = `${embedSizes.height}`;
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

  static icon() {
    return "";
  }

  static getTumblrEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadPost(
    node: HTMLDivElement,
    data: {
      href: string;
      did: string;
      url: string;
    }
  ) {
    const tumblrNode = document.createElement("div");
    tumblrNode.classList.add("tumblr-post");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    tumblrNode.dataset.href = data.href;
    tumblrNode.dataset.did = data.did;
    tumblrNode.dataset.url = data.url;
    node.dataset.href = data.href;
    node.dataset.did = data.did;
    node.dataset.url = data.url;
    const tumblrNodeContainer = document.createElement("div");
    tumblrNodeContainer.appendChild(tumblrNode);
    tumblrNodeContainer.style.visibility = "hidden";
    node.appendChild(
      addEmbedOverlay(tumblrNodeContainer, {
        onClose: () => {
          TumblrEmbed.onRemoveRequest?.(node);
        },
      })
    );
    attachObserver(node);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://assets.tumblr.com/post.js");
    document.body.appendChild(fileref);
  }

  static renderFromUrl(node: HTMLDivElement, url: string) {
    if (!url) {
      // TODO: make a decent error here
      return;
    }

    TumblrEmbed.getTumblrEmbedFromUrl(url)
      .then((data) => {
        TumblrEmbed.loadPost(node, data);
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
    node.classList.add("tumblr", "loading");
    const loadingMessage = document.createElement("p");
    loadingMessage.innerHTML = "Loading female-presenting nipples...";
    loadingMessage.classList.add("loading-message");
    node.appendChild(loadingMessage);

    if (typeof value == "string") {
      return TumblrEmbed.renderFromUrl(node, this.sanitize(value));
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
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
}

TumblrEmbed.blotName = "tumblr-embed";
TumblrEmbed.tagName = "div";
TumblrEmbed.className = "ql-tumblr-embed";

Icon["tumblr"] = TumblrEmbed.icon();

export default TumblrEmbed;
