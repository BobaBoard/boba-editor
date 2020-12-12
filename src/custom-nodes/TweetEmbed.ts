import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

import { addEmbedOverlay, addLoadingMessage, addErrorMessage } from "./utils";

const logging = require("debug")("bobapost:embeds:tweet");
const loggingVerbose = require("debug")("bobapost:embeds:tweet-verbose");

// @ts-ignore
import TwitterIcon from "../img/twitter.svg";
import { EmbedValue } from "../config";

interface TweetEmbed extends EmbedValue {
  href: string;
  did: string;
  spoilers?: boolean;
  thread?: boolean;
}

const getTweetEmbedUrl = (data: { hideThread: string; id: string }) =>
  `https://platform.twitter.com/embed/index.html?dnt=true&frame=false&hideCard=false&hideThread=${data.hideThread}&id=${data.id}&theme=dark&widgetsVersion=ed20a2b%3A1601588405575&width=550px`;

const loadTwitterEmbed = (tweetData: {
  parent: HTMLElement;
  embedSrc: string;
  embedWidth: string;
  onNotFound: () => void;
  onLoad: (size: {
    height: string;
    width: string;
    iframeNode: HTMLIFrameElement;
  }) => void;
}) => {
  // We cannot load this offscreen cause Twitter will throw a fit.
  const iframeNode = document.createElement("iframe");
  const onload = (e: MessageEvent) => {
    if (!parent.parent) {
      window.removeEventListener("message", onload);
    }
    if (iframeNode.contentWindow == e.source) {
      const data = e.data["twttr.embed"];
      if (data?.method == "twttr.private.no_results") {
        iframeNode.parentElement?.removeChild(iframeNode);
        tweetData.onNotFound();
      }
      if (data?.method == "twttr.private.resize") {
        logging(
          `Twitter height callback received. Height: ${data.params[0]?.height}`
        );
        const height = data.params[0]?.height as string;
        iframeNode.height = height;
        iframeNode.style.opacity = "1";
        if (tweetData.parent.style.height !== height + "px") {
          tweetData.parent.style.height = height + "px";
        }
        tweetData.onLoad({
          width: data.embedWidth,
          height: e.data.height,
          iframeNode: iframeNode,
        });
      }
    }
  };
  window.addEventListener("message", onload);
  tweetData.parent.appendChild(iframeNode);
  iframeNode.style.opacity = "0";
  iframeNode.width = "100%";
  iframeNode.src = tweetData.embedSrc;
};
/**
 * TweetEmbed represents a tweet embedded into the editor.
 *
 * Note: the twitter JS library must be installed for the tweets to
 * actually load.
 */
class TweetEmbed extends BlockEmbed {
  static tweetOptions = {
    theme: "dark",
    width: 550,
    align: "center",
  };

  static doneLoading(node: HTMLElement) {
    logging(`Removing loading message!`);
    node.classList.remove("loading");
    // Remove loading message
    const loadingNode = node.querySelector(".loading-message");
    if (loadingNode) {
      node.removeChild(loadingNode);
    }
  }

  static loadTweet(id: string, node: HTMLElement) {
    const embedUrl = getTweetEmbedUrl({
      id,
      hideThread: node.dataset.thread == "true" ? "false" : "true",
    });
    logging(`Loading tweet with id ${id}.`);
    const containerWidth =
      "" + this.getEditorReference().getBoundingClientRect().width;
    logging(`Editor width is ${containerWidth}.`);
    const renderedNode = node.querySelectorAll(".twitter-tweet-rendered");
    loadTwitterEmbed({
      parent: node,
      embedSrc: embedUrl,
      embedWidth: containerWidth,
      onLoad: (data) => {
        if (renderedNode.length > 0) {
          renderedNode[0].parentElement?.removeChild(renderedNode[0]);
        }
        data.iframeNode.classList.add("twitter-tweet-rendered");
        node.dataset.rendered = "true";
        node.dataset.embedWidth = `${containerWidth}`;
        node.dataset.embedHeight = `${data.height}`;
        TweetEmbed.doneLoading(node);
        if (TweetEmbed.onLoadCallback) {
          // Add some time to remove the loading class or the
          // calculation of the new tooltip position will be
          // weird
          // TODO: figure out why rather than hack it.
          setTimeout(() => TweetEmbed.onLoadCallback(node), 100);
        }
      },
      onNotFound: () => {
        TweetEmbed.doneLoading(node);
        addErrorMessage(node, {
          message: "This tweet.... it dead.",
          url: TweetEmbed.value(node).url || "",
        });
        if (TweetEmbed.onLoadCallback) {
          // Add some time to remove the loading class or the
          // calculation of the new tooltip position will be
          // weird
          // TODO: figure out why rather than hack it.
          setTimeout(() => TweetEmbed.onLoadCallback(node), 100);
        }
        logging(`Ooops, there's no tweet there!`);
      },
    });
  }
  static create(value: string | EmbedValue | TweetEmbed) {
    const node = super.create();
    logging(`Creating new tweet embed with value ${value}`);
    const url = new URL(
      typeof value == "string" ? this.sanitize(value) : value.url
    );
    const id = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);
    node.dataset.url = url.href;
    node.contentEditable = false;
    node.dataset.id = id;
    node.dataset.rendered = false;
    if (!!value["thread"]) {
      node.dataset.thread = "true";
    }

    logging(`Tweet url: ${url}`);
    logging(`Tweet id: ${id}`);

    node.classList.toggle("spoilers", !!value["spoilers"]);

    if (id) {
      addLoadingMessage(node, {
        message: "Preparing to chirp...",
        url: url.href,
        width: value["embedWidth"],
        height: value["embedHeight"],
      });
    } else {
      TweetEmbed.doneLoading(node);
      addErrorMessage(node, {
        message: "This tweet.... it dead.",
        url: TweetEmbed.value(node).url || "",
      });
      if (TweetEmbed.onLoadCallback) {
        // Add some time to remove the loading class or the
        // calculation of the new tooltip position will be
        // weird
        // TODO: figure out why rather than hack it.
        setTimeout(() => TweetEmbed.onLoadCallback(node), 100);
      }
      logging(`Ooops, there's no tweet there!`);
      return node;
    }

    // TODO: this should be generalized rather than making everyone have access
    // to a method only twitter really needs
    addEmbedOverlay(
      node,
      {
        onClose: () => {
          TweetEmbed.onRemoveRequest?.(node);
        },
        onMarkSpoilers: (node, spoilers) => {
          if (spoilers) {
            node.setAttribute("spoilers", "true");
          } else {
            node.removeAttribute("spoilers");
          }
        },
        onChangeThread: (node, thread) => {
          node.dataset.thread = thread ? "true" : "";
          TweetEmbed.loadTweet(id, node);
        },
      },
      {
        isThread: node.dataset.thread === "true",
        isSpoilers: !!value["spoilers"],
      }
    );

    node.classList.add("ql-embed", "tweet", "loading");
    TweetEmbed.loadTweet(id, node);

    if (!!value["spoilers"]) {
      node.addEventListener("click", () => {
        node.classList.toggle("show-spoilers");
      });
    }
    return node;
  }

  static setOnLoadCallback(callback: (root: HTMLDivElement) => void) {
    TweetEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLElement) {
    loggingVerbose(`Getting value of embed from data:`);
    loggingVerbose(domNode.dataset);
    const spoilers = domNode.getAttribute("spoilers");
    return {
      url: domNode.dataset.url,
      embedWidth: domNode.dataset.embedWidth,
      embedHeight: domNode.dataset.embedHeight,
      spoilers: !!spoilers,
      thread: !!domNode.dataset.thread,
    };
  }

  static sanitize(url: string) {
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static blotName = "tweet";
  static tagName = "div";
  static className = "ql-tweet";
}

export default TweetEmbed;
