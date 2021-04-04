import { EditorContextProps } from "../Editor";
import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
import {
  addEmbedEditOverlay,
  addErrorMessage,
  addLoadingMessage,
} from "./utils";
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
 * This is the base class to load embeds from iFramely.
 * It does the best it can to display the data returned.
 * Sometimes, that is enough.
 */
class OEmbed extends BlockEmbed {
  static icon() {
    return "";
  }
  static SKIP_EMBED_LOADING = true;
  static FORCE_EMBED = false;
  static cache: EditorContextProps["cache"] | undefined;

  static onLoadEnd(
    domNode: HTMLElement,
    embedLoadingNode: HTMLElement | null,
    sizes?: {
      embedWidth: string;
      embedHeight: string;
    }
  ) {
    // Remove the loading message
    const loadingMessage = domNode.querySelector(".loading-message");
    logging(loadingMessage);
    loadingMessage?.parentNode?.removeChild(loadingMessage);
    // If the embed was loaded from an offscreen node, move the embed node
    // within the screen again.
    if (embedLoadingNode) {
      embedLoadingNode.style.position = "relative";
      embedLoadingNode.style.left = "0";
    }
    domNode.classList.add("loaded");
    domNode.classList.remove("loading");
    const oEmbedNode = domNode.querySelector(".embed-node");
    oEmbedNode?.classList.add("loaded");
    oEmbedNode?.classList.remove("loading");
    logging(domNode);
    // If we already know the size of the embed (i.e. this is not the first time
    // this embed has been loaded), then simply display the embed with the given sizes.
    if (sizes) {
      domNode.dataset.embedWidth = `${sizes.embedWidth}`;
      domNode.dataset.embedHeight = `${sizes.embedHeight}`;
      this.onLoadCallback?.();
      if (!this.SKIP_CACHE) {
        // We set the embed in the cache, unless this type of embed has been marked
        // for "no caching". This usually happens when iframe clear their content once
        // the embed is removed from the DOM (e.g. Reddit does this).
        OEmbed.cache?.set(domNode.dataset.url!, domNode);
      }
    } else {
      // Approximate sizes from BoundingClientRect.
      // Add an extra timeout so the size will have set. Sometimes the size
      // will be wrong without an extra delay.
      // TODO: yes, I know, this whole thing is brittle.
      setTimeout(() => {
        const embedSizes = domNode.getBoundingClientRect();
        domNode.dataset.embedWidth = `${embedSizes.width}`;
        domNode.dataset.embedHeight = `${embedSizes.height}`;
        logging(domNode);

        this.onLoadCallback?.();
        if (!this.SKIP_CACHE) {
          OEmbed.cache?.set(domNode.dataset.url!, domNode);
        }
      }, 200);
    }
  }

  static getOEmbedFromUrl = (url: any): Promise<any> => {
    throw new Error("unimplemented");
  };

  static loadImagePost(
    node: HTMLDivElement,
    image: HTMLImageElement,
    href: string
  ) {
    // Wrap the image with the URL of the embed.
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
    // Wait for image load to be complete before signaling that loading
    // has finished.
    if (image.complete) {
      this.onLoadEnd(node, imageParent);
    } else {
      image.onload = () => {
        this.onLoadEnd(node, imageParent);
      };
    }
    return;
  }

  static chooseThumbnailImageLinks(thumbnailLinks: any) {
    const imageLinks = thumbnailLinks.filter((link: any) =>
      link.type.startsWith("image")
    );

    if (imageLinks.length === 0) {
      // If there are no images, don't display any images.
      return [];
    } else if (imageLinks[0].rel.includes("og")) {
      // Otherwise, display the first image link.
      // If that's an Open Graph link, display all Open Graph links.
      return imageLinks.filter((link: any) => link.rel.includes("og"));
    } else {
      // If the first link isn't an Open Graph link, display only one preview image.
      return [imageLinks[0]];
    }
  }

  static tryBestEffortLoad(
    node: HTMLDivElement,
    loadingDiv: HTMLElement,
    data: any,
    href: string
  ) {
    node.classList.add("best-effort");
    // Look for as much information as we can get in the data.
    const imageUrls = this.chooseThumbnailImageLinks(
      data.links?.thumbnail || []
    ).map((link: any) => link.href);
    const iconUrl = data?.links?.icon?.find((link: any) =>
      link.type.startsWith("image")
    )?.href;
    const description = data.meta?.description;
    const title = data.meta?.title;

    const container = document.createElement("div");
    // Add the favicon as a background element.
    if (iconUrl) {
      container.style.backgroundImage = `url(${iconUrl})`;
      container.classList.add("container", "with-icon");
    }
    // Wrap the whole embed in a link to the embed URL.
    const linkElement = document.createElement("a");
    linkElement.href = href;
    container.appendChild(linkElement);
    // If there are any images, add them.
    const images: Array<HTMLImageElement> = imageUrls.map(
      (imageUrl: string) => {
        let image = document.createElement("img");
        image.src = imageUrl;
        return image;
      }
    );
    images.forEach((image: HTMLImageElement) => {
      linkElement.appendChild(image);
    });
    // Use the title of the page as the embed title.
    if (title) {
      const titleElement = document.createElement("h1");
      titleElement.innerText = title.trim();
      linkElement.appendChild(titleElement);
    }
    // Use the description of the page as the embed body.
    if (description) {
      const descriptionElement = document.createElement("p");
      descriptionElement.innerText = description;
      linkElement.appendChild(descriptionElement);
    }
    loadingDiv.appendChild(container);
    // Wait for the images to load (if present) to signal that the embed has
    // finished loading.
    Promise.all<void>(
      images.map(
        (image: any) =>
          new Promise((resolve, reject) => {
            if (image.complete) {
              resolve();
            } else {
              image.onload = () => {
                resolve();
              };
            }
          })
      )
    ).then(() => {
      this.onLoadEnd(node, loadingDiv);
    });
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
    // While the embed is loading, we move it way to the side of the screen, so it won't
    // be visible to the user. Some embeds don't load correctly when they have display:none,
    // or visibility:hidden, so we have to make do.
    oEmbedNode.style.position = "absolute";
    oEmbedNode.style.left = "-1000000px";
    oEmbedNode.style.top = "0";
    if (!("html" in data)) {
      // There is no html within data, so we don't have an easy way of displaying the result.
      // We will then have to take the data we have and see what we can do with it.
      return this.tryBestEffortLoad(node, oEmbedNode, data.data, data.url);
    }
    oEmbedNode.innerHTML = data.html;
    if (
      (isIframeEmbed(oEmbedNode) || this.FORCE_EMBED) &&
      !this.SKIP_EMBED_LOADING
    ) {
      logging(`Attaching loading observer.`);
      // With iframes (and some other embed types that swap regular HTML for iframes), it usually
      // takes a while before the embed content is loaded. We listen to changes to the embed with
      // an observer to determine when the content loading has finished.
      attachObserver(oEmbedNode, () => {
        this.onLoadEnd(node, oEmbedNode);
      });
    } else if (isImageEmbed(oEmbedNode)) {
      logging(`Waiting for image load.`);
      // Some embeds contain an image. Wait for the image to have finished loading so that
      // the size has settled.
      // TODO: how do we deal with more than one image?
      this.loadImagePost(
        node,
        oEmbedNode.querySelector("img") as HTMLImageElement,
        data.url
      );
    } else {
      // This is the simplest form of embed possible. Immediately call load end.
      logging(`Finished loading (no observer).`);
      this.onLoadEnd(node, oEmbedNode);
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
        message: "No valid url found in embed post! è.é",
      });
      this.onLoadEnd(node, null);
      return node;
    }

    node.dataset.url = url;
    OEmbed.getOEmbedFromUrl(url)
      .then((data) => {
        if (data.error) {
          this.renderError(node, url, data.error.message);
          // Add the url to the dataset anyway, in case the error
          // is transient.
          return;
        }
        this.loadPost(
          node,
          data.html ? { html: data.html, url } : { data, url }
        );
      })
      .catch((err) => {
        this.renderError(
          node,
          url,
          `Error when fetching data from embed endpoint: ${err}`
        );
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

    const url = this.sanitize(value.url);

    // If you can already find an embed with this url in the cache (or this
    // particular embed type is not cache-friendly), just retrieve the node
    // from the cache, and stop the rendering.
    if (this.cache?.has(url) && !this.SKIP_CACHE) {
      return this.cache.get(url);
    }

    addLoadingMessage(node, {
      color: this.LOADING_BACKGROUND_COLOR,
      message: this.LOADING_TEXT,
      url: value.url,
      width: value.embedWidth,
      height: value.embedHeight,
    });
    addEmbedEditOverlay(node, {
      onClose: () => {
        this.onRemoveRequest?.(node);
      },
    });

    node.classList.add("ql-embed", "loading");
    // If we already have a saved width and height for the embed, we can add
    // it to the loading node. This allows us to (somewhat) avoid layout shifting
    // once the embed is loaded.
    if (value.embedHeight && value.embedWidth) {
      const ratio =
        (parseInt(value.embedHeight) / parseInt(value.embedWidth)) * 100;
      logging(ratio);

      node.style.setProperty("--ratio-padding", `${ratio}%`);
    }
    return this.renderFromUrl(node, url);
  }

  static setOnLoadCallback(callback: () => void) {
    OEmbed.onLoadCallback = callback;
  }

  static setCache(cache: EditorContextProps["cache"]) {
    OEmbed.cache = cache;
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
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
  static blotName = "oembed-embed";
  static tagName = "div";
  static className = "ql-oembed-embed";
}

export default OEmbed;
