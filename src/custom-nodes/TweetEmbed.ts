import { addErrorMessage, addLoadingMessage, makeSpoilerable } from "./utils";

import { EditorContextProps } from "../Editor";
import { EmbedValue } from "../config";
import Quill from "quill";
import ThreadIcon from "../img/thread.svg";
import { TweetEmbed as TweetEmbedInterface } from "../config";
import { addEmbedEditOverlay } from "./utils/embed-overlay";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

const logging = require("debug")("bobapost:embeds:tweet");
const loggingVerbose = require("debug")("bobapost:embeds:tweet-verbose");

const eventListener = ({
  tweetId,
  onSuccess,
  onFailure,
}: {
  tweetId: string;
  onSuccess: (_: { width: number; height: number }) => void;
  onFailure: () => void;
}) => {
  let lastSize: { width: number; height: number } | null = null;
  return (event: MessageEvent) => {
    if (
      event.origin !== "https://platform.twitter.com" ||
      !event.data["twttr.embed"]
    ) {
      return;
    }
    const { method, params } = event.data["twttr.embed"];
    console.log(method, params);
    if (params[0]?.data?.tweet_id !== tweetId) {
      return;
    }
    // The tweet is broken.
    if (method === "twttr.private.no_results") {
      onFailure();
      return;
    }
    // This window message is from the twitter embed library, and it signals an
    // events related to our current tweet.
    if (params?.[0]?.width || params?.[0]?.height) {
      // This message has a payload with the size of the rndered tweet.
      // We save it, then wait for the tweet to render.
      lastSize = {
        width: params?.[0]?.width,
        height: params?.[0]?.height,
      };
    }
    if (method === "twttr.private.rendered" && lastSize) {
      // The tweet has rendered and we have the size. Time to pass it back!
      onSuccess(lastSize);
    }
  };
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

  static cache: EditorContextProps["cache"] | undefined;

  static doneLoading(
    node: HTMLElement,
    tweetEventListener: (event: MessageEvent) => void
  ) {
    console.log("removing size promise");
    window.removeEventListener("message", tweetEventListener);
    logging(`Removing loading message!`);
    node.classList.remove("loading");
    // Remove loading message
    const loadingNode = node.querySelector(".loading-message");
    if (loadingNode) {
      node.removeChild(loadingNode);
    }
  }

  static loadTweet(id: string, node: HTMLElement, attemptsRemaining = 5) {
    let tweetEventListener: (event: MessageEvent) => void;
    const sizePromise = new Promise((resolve, reject) => {
      console.log("setting size promise");
      tweetEventListener = eventListener({
        tweetId: id,
        onSuccess: resolve,
        onFailure: reject,
      });
      window.addEventListener("message", tweetEventListener);
    });
    // @ts-ignore
    window?.twttr?.widgets
      ?.createTweet(id, node, {
        ...TweetEmbed.tweetOptions,
        conversation: node.dataset.thread === "true" ? undefined : "none",
      })
      .then((el: HTMLDivElement) => {
        // If there is more than one rendered tweet here, it means we're in a
        // "option change" situation. Remove the older.
        const renderedNode = node.querySelectorAll(".twitter-tweet");
        if (renderedNode.length > 1) {
          renderedNode[0].parentElement?.removeChild(renderedNode[0]);
        }
        logging(`Tweet loading has started!`);
        sizePromise
          .then((size) => {
            requestAnimationFrame(() => {
              TweetEmbed.doneLoading(node, tweetEventListener);
              node.dataset.rendered = "true";
              const embedSizes = el.getBoundingClientRect();
              console.log("received", size);
              console.log(embedSizes.width, embedSizes.height);
              node.dataset.embedWidth = `${embedSizes.width}`;
              node.dataset.embedHeight = `${embedSizes.height}`;
              if (TweetEmbed.onLoadCallback) {
                // Add some time to remove the loading class or the
                // calculation of the new tooltip position will be
                // weird
                // TODO: figure out why rather than hack it.
                setTimeout(() => TweetEmbed.onLoadCallback(el), 100);
                TweetEmbed.cache?.set(
                  TweetEmbed.getHashForCache(TweetEmbed.value(node)),
                  node
                );
              }
            });
          })
          .catch(() => {
            node.dataset.rendered = "true";
            el.parentElement?.removeChild(el);
            TweetEmbed.doneLoading(node, tweetEventListener);
            addErrorMessage(node, {
              message: "This tweet.... it dead.",
              url: TweetEmbed.value(node).url || "",
              width: TweetEmbed.value(node)["embedWidth"],
              height: TweetEmbed.value(node)["embedHeight"],
            });
            logging(`Ooops, there's no tweet there!`);
            return;
          });
      })
      .catch((e: any) => {
        logging(`There was a serious error during tweet creation!`);
        logging(e);
        TweetEmbed.doneLoading(node, tweetEventListener);
        addErrorMessage(node, {
          message: `This tweet.... it bad.<br />(${e.message})`,
          url: TweetEmbed.value(node).url || "",
          width: TweetEmbed.value(node)["embedWidth"],
          height: TweetEmbed.value(node)["embedHeight"],
        });
      });
    // If the twitter library is not loaded yet, defer rendering
    // TODO: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
    // @ts-ignore
    if (!window?.twttr?.widgets) {
      logging(`Twitter main library is not loaded.`);
      logging(`${attemptsRemaining} reload attempts remaining`);
      if (!attemptsRemaining) {
        logging(`We're out of attempts! Time to panic!`);
        // @ts-ignore
        TweetEmbed.doneLoading(node, tweetEventListener);
        addErrorMessage(node, {
          message: "The Twitter Embeds library... it dead.",
          url: TweetEmbed.value(node).url || "",
          width: TweetEmbed.value(node)["embedWidth"],
          height: TweetEmbed.value(node)["embedHeight"],
        });
        return;
      }
      setTimeout(
        () => TweetEmbed.loadTweet(id, node, attemptsRemaining - 1),
        50
      );
    }
  }

  static renderTweets() {
    // This method needs to be called for any non-quill environments
    // otherwise, tweets will not be rendered
    const tweets = document.querySelectorAll(
      "div.ql-tweet"
    ) as NodeListOf<HTMLDivElement>;
    for (var i = 0; i < tweets.length; i++) {
      while (tweets[i].firstChild) {
        tweets[i].removeChild(tweets[i].firstChild as HTMLDivElement);
      }
      TweetEmbed.loadTweet(tweets[i].dataset.id || "", tweets[i]);
    }
  }

  static create(value: string | EmbedValue | TweetEmbedInterface) {
    const node = super.create();
    logging(`Creating new tweet embed with value ${value}`);
    const url = new URL(
      typeof value == "string" ? this.sanitize(value) : value.url
    );
    const id = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);
    node.dataset.url = url.href;
    if (value["embedWidth"]) {
      node.dataset.embedWidth = value["embedWidth"];
    }
    if (value["embedHeight"]) {
      node.dataset.embedHeight = value["embedHeight"];
    }
    node.contentEditable = false;
    node.dataset.id = id;
    node.dataset.rendered = false;
    if (!!value["thread"]) {
      node.dataset.thread = "true";
    }

    logging(`Tweet url: ${url}`);
    logging(`Tweet id: ${id}`);

    if (
      typeof value !== "string" &&
      "url" in value &&
      TweetEmbed.cache?.get(TweetEmbed.getHashForCache(value))
    ) {
      // When refetching from cache, readd spoilers status
      const cachedNode = TweetEmbed.cache?.get(
        TweetEmbed.getHashForCache(value)
      )!;
      cachedNode.setAttribute("data-from-cache", "true");
      makeSpoilerable(this, cachedNode, value);
      return cachedNode;
    }

    addLoadingMessage(node, {
      message: "Preparing to chirp...",
      url: url.href,
      width: value["embedWidth"],
      height: value["embedHeight"],
    });

    makeSpoilerable(this, node, value);
    addEmbedEditOverlay(this, node, [
      {
        icon: ThreadIcon,
        initialValue: node.dataset.thread === "true",
        onToggle: (node, thread) => {
          node.dataset.thread = thread ? "true" : "";
          TweetEmbed.loadTweet(id, node);
        },
      },
    ]);

    node.classList.add("ql-embed", "tweet", "loading");
    TweetEmbed.loadTweet(id, node);

    return node;
  }

  optimize(context: any) {
    const rootNode = this.domNode as HTMLElement;
    // If the editor is view-only, and there's no spoilers remove the embeds overlay
    if (rootNode.closest(".editor.view-only")) {
      const embedOverlay = rootNode.querySelector(".embed-overlay");
      if (embedOverlay?.classList.contains("spoilers")) {
        embedOverlay.innerHTML = "";
      } else {
        embedOverlay?.parentElement?.removeChild(embedOverlay);
      }
    }
  }

  static setOnLoadCallback(callback: (root: HTMLDivElement) => void) {
    TweetEmbed.onLoadCallback = callback;
  }

  static setCache(cache: EditorContextProps["cache"]) {
    TweetEmbed.cache = cache;
  }

  static value(domNode: HTMLElement) {
    loggingVerbose(`Getting value of embed from data:`);
    loggingVerbose(domNode.dataset);
    return {
      url: domNode.dataset.url!,
      embedWidth: domNode.dataset.embedWidth,
      embedHeight: domNode.dataset.embedHeight,
      thread: !!domNode.dataset.thread,
    };
  }

  static sanitize(url: string) {
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static getHashForCache(value: EmbedValue | TweetEmbedInterface) {
    return value.url;
  }

  static blotName = "tweet";
  static tagName = "div";
  static className = "ql-tweet";
}

export default TweetEmbed;
