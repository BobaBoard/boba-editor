import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
import { addEmbedOverlay, addErrorMessage, addLoadingMessage } from "./utils";
const Link = Quill.import("formats/link");

const logging = require("debug")("bobapost:embeds:oembeds");

const attachObserver = function (
  domNode: HTMLDivElement,
  onLoadEnd: () => void
) {
  let newObserver = new MutationObserver((mutations, observer) => {
    logging(`Mutation occurred in embedded node.`);
    const potentialIframe = (mutations[0]
      ?.addedNodes[0] as HTMLElement)?.querySelector("iframe");
    if (potentialIframe) {
      const currentHeight = potentialIframe.getBoundingClientRect().height;
      logging(`Current height of observed node: ${currentHeight}`);
      observer.disconnect();
      const checkNewHeight = () => {
        logging(
          `New height of observed node: ${
            potentialIframe.getBoundingClientRect().height
          }`
        );
        if (potentialIframe.getBoundingClientRect().height != currentHeight) {
          onLoadEnd();
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

const isIframeEmbed = (domNode: HTMLElement) => {
  return !!domNode.querySelector("iframe");
};

const isImageEmbed = (domNode: HTMLElement) => {
  return !!domNode.querySelector("img");
};

/**
 * TumblrEmbed represents a tumblr post embedded into the editor.
 */
class OEmbed extends BlockEmbed {
  static icon() {
    return "";
  }
  static SKIP_EMBED_LOADING = true;
  static FORCE_EMBED = false;

  static onLoadEnd(
    domNode: HTMLElement,
    embedLoadingNode: HTMLElement | null,
    sizes?: {
      embedWidth: string;
      embedHeight: string;
    }
  ) {
    const loadingMessage = domNode.querySelector(".loading-message");
    logging(loadingMessage);
    loadingMessage?.parentNode?.removeChild(loadingMessage);
    if (embedLoadingNode) {
      embedLoadingNode.style.position = "relative";
      embedLoadingNode.style.left = "0";
    }
    domNode.classList.add("loaded");
    domNode.classList.remove("loading");
    const oEmbedNode = domNode.querySelector(".embed-node");
    oEmbedNode?.classList.add("loaded");
    oEmbedNode?.classList.remove("loading");
    // Add an extra timeout so the size will have set
    // TODO: yes, I know, this whole thing is brittle.
    logging(domNode);
    if (sizes) {
      domNode.dataset.embedWidth = `${sizes.embedWidth}`;
      domNode.dataset.embedHeight = `${sizes.embedHeight}`;
    } else {
      // Approximate sizes from BoundingClientRect.
      // Add an extra timeout so the size will have set
      // TODO: yes, I know, this whole thing is brittle.
      setTimeout(() => {
        const embedSizes = domNode.getBoundingClientRect();
        domNode.dataset.embedWidth = `${embedSizes.width}`;
        domNode.dataset.embedHeight = `${embedSizes.height}`;
        logging(domNode);
        this.onLoadCallback?.();
      }, 200);
    }
    this.onLoadCallback?.();
  }

  static getOEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadImagePost(
    node: HTMLDivElement,
    image: HTMLImageElement,
    href: string
  ) {
    const imageParent = image.parentElement;
    if (!imageParent) {
      // TODO: add error here
      return;
    }
    const detachedImageNode = imageParent.removeChild(image);
    const link = document.createElement("a");
    link.href = href;
    link.appendChild(detachedImageNode);
    imageParent.appendChild(link);
    if (image.complete) {
      this.onLoadEnd(node, link, {
        embedWidth: `${image.naturalWidth}`,
        embedHeight: `${image.naturalHeight}`,
      });
    } else {
      image.onload = () => {
        this.onLoadEnd(node, imageParent, {
          embedWidth: `${image.naturalWidth}`,
          embedHeight: `${image.naturalHeight}`,
        });
      };
    }
    return;
  }

  static tryBestEffortLoad(
    node: HTMLDivElement,
    loadingDiv: HTMLElement,
    data: any,
    href: string
  ) {
    node.classList.add("best-effort");
    const imageUrl = data.links?.thumbnail?.find((link: any) =>
      link.type.startsWith("image/")
    )?.href;
    const description = data.meta?.description;
    const title = data.meta?.title;

    const container = document.createElement("div");
    const linkElement = document.createElement("a");
    linkElement.href = href;
    container.appendChild(linkElement);
    let image: HTMLImageElement | null = null;
    if (imageUrl) {
      image = document.createElement("img");
      image.src = imageUrl;
      linkElement.appendChild(image);
    }
    if (title) {
      const titleElement = document.createElement("h1");
      titleElement.innerText = title;
      linkElement.appendChild(titleElement);
    }
    if (description) {
      const descriptionElement = document.createElement("p");
      descriptionElement.innerText = description;
      linkElement.appendChild(descriptionElement);
    }
    loadingDiv.appendChild(container);
    if (image) {
      if (image.complete) {
        this.onLoadEnd(node, loadingDiv);
      } else {
        image.onload = () => {
          this.onLoadEnd(node, loadingDiv);
        };
      }
    } else {
      this.onLoadEnd(node, loadingDiv);
    }
  }

  static loadPost(
    node: HTMLDivElement,
    data:
      | {
          html: string;
          url: string;
        }
      | { data: any; url: string }
  ) {
    const oEmbedNode = document.createElement("div");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    oEmbedNode.dataset.url = data.url;
    oEmbedNode.classList.add("embed-node");
    oEmbedNode.classList.add("loading");
    node.dataset.url = data.url;
    node.appendChild(oEmbedNode);
    oEmbedNode.style.position = "absolute";
    oEmbedNode.style.left = "-1000000px";
    oEmbedNode.style.top = "0";
    if (!("html" in data)) {
      return this.tryBestEffortLoad(node, oEmbedNode, data.data, data.url);
    }
    oEmbedNode.innerHTML = data.html;
    if (
      (isIframeEmbed(oEmbedNode) || this.FORCE_EMBED) &&
      !this.SKIP_EMBED_LOADING
    ) {
      logging(`Attaching loading observer.`);
      attachObserver(oEmbedNode, () => {
        this.onLoadEnd(node, oEmbedNode);
      });
    } else if (isImageEmbed(oEmbedNode)) {
      this.loadImagePost(
        node,
        oEmbedNode.querySelector("img") as HTMLImageElement,
        data.url
      );
    } else {
      logging(`Finished loading (no observer).`);
      this.onLoadEnd(oEmbedNode, oEmbedNode);
    }
  }

  static renderError(node: HTMLDivElement, url: string, error: string) {
    addErrorMessage(node, {
      message: `The embed bugs strike again! (${error})`,
      url,
    });
    this.onLoadEnd(node, null);
  }

  static renderFromUrl(node: HTMLDivElement, url: string) {
    if (!url) {
      addErrorMessage(node, {
        message: "No valid url found in embed post!",
        url: "#",
      });
      this.onLoadEnd(node, null);
      return node;
    }

    OEmbed.getOEmbedFromUrl(url)
      .then((data) => {
        if (data.error) {
          this.renderError(node, url, data.error.message);
          // Add the url to the dataset anyway, in case the error
          // is transient.
          node.dataset.url = url;
          return;
        }
        this.loadPost(
          node,
          data.html ? { html: data.html, url } : { data, url }
        );
      })
      .catch((err) => {
        logging(err);
      });

    return node;
  }

  static LOADING_BACKGROUND_COLOR = "#e6e6e6";
  static LOADING_TEXT = "Doing my best!";
  static create(value: {
    url: string;
    embedHeight?: string;
    embedWidth?: string;
  }) {
    logging(`Creating oEmbed object with value:`);
    logging(value);
    let node = super.create();
    node.contentEditable = false;
    node.dataset.rendered = false;

    addLoadingMessage(node, {
      color: this.LOADING_BACKGROUND_COLOR,
      message: this.LOADING_TEXT,
      url: value.url,
      width: value.embedWidth,
      height: value.embedHeight,
    });
    addEmbedOverlay(node, {
      onClose: () => {
        this.onRemoveRequest?.(node);
      },
    });

    node.classList.add("ql-embed", "loading");
    if (value.embedHeight && value.embedWidth) {
      const ratio =
        (parseInt(value.embedHeight) / parseInt(value.embedWidth)) * 100;
      logging(ratio);

      node.style.setProperty("--ratio-padding", `${ratio}%`);
    }
    return this.renderFromUrl(node, this.sanitize(value.url));
  }

  static setOnLoadCallback(callback: () => void) {
    OEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return {
      url: domNode.dataset.url,
      embedWidth: domNode.dataset.embedWidth,
      embedHeight: domNode.dataset.embedHeight,
    };
  }

  static sanitize(url: string) {
    if (!url) {
      return "";
    }
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
  static blotName = "oembed-embed";
  static tagName = "div";
  static className = "ql-oembed-embed";
}

export default OEmbed;
