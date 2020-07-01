import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

import { addEmbedOverlay } from "./utils";

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

  static loadTweet(id, node, attemptsRemaining = 5) {
    // @ts-ignore
    window?.twttr?.widgets
      ?.createTweet(id, node, TweetEmbed.tweetOptions)
<<<<<<< HEAD
      .then((el) => {
=======
      .then((el: HTMLDivElement) => {
>>>>>>> 6f9e6e5375231e5818c50358cb85979ee8cad4bc
        node.classList.remove("loading");
        node.dataset.rendered = true;
        // Remove loading message
<<<<<<< HEAD
        node.removeChild(node.querySelector(".loading-message"));
=======
        node.removeChild(
          node.querySelector(".loading-message") as HTMLDivElement
        );
>>>>>>> 6f9e6e5375231e5818c50358cb85979ee8cad4bc
        if (!el) {
          node.classList.add("error");
          node.innerHTML = "This tweet.... it dead.";
        }
        if (TweetEmbed.onLoadCallback) {
          // Add some time to remove the loading class or the
          // calculation of the new tooltip position will be
          // weird
          // TODO: figure out why rather than hack it.
          setTimeout(() => TweetEmbed.onLoadCallback(el), 100);
        }
      });
    // If the twitter library is not loaded yet, defer rendering
    // @ts-ignore
    if (!window?.twttr?.widgets) {
      if (!attemptsRemaining) {
        node.classList.add("error");
        node.innerHTML = "This tweet.... it dead.";
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
    const tweets = document.querySelectorAll("div.ql-tweet") as NodeListOf<
      HTMLDivElement
    >;
    for (var i = 0; i < tweets.length; i++) {
      while (tweets[i].firstChild) {
        tweets[i].removeChild(tweets[i].firstChild);
      }
      TweetEmbed.loadTweet(tweets[i].dataset.id, tweets[i]);
    }
  }

<<<<<<< HEAD
  static create(value) {
=======
  static create(value: any) {
>>>>>>> 6f9e6e5375231e5818c50358cb85979ee8cad4bc
    let node = super.create();
    console.log(value);
    let url = this.sanitize(value);
    let id = url.substr(url.lastIndexOf("/") + 1);
    node.dataset.url = url;
    node.contentEditable = false;
    node.dataset.id = id;
    node.dataset.rendered = false;

    const loadingMessage = document.createElement("p");
    loadingMessage.innerHTML = "Preparing to chirp...";
    loadingMessage.classList.add("loading-message");

    let embedNode = addEmbedOverlay(node, {
      onClose: () => {
        TweetEmbed.onRemoveRequest?.(embedNode);
      },
    });
    embedNode.appendChild(loadingMessage);
    embedNode.classList.add("ql-embed", "tweet", "loading");
    TweetEmbed.loadTweet(id, embedNode);
    return embedNode;
  }

  static setOnLoadCallback(callback) {
    TweetEmbed.onLoadCallback = callback;
  }

<<<<<<< HEAD
  static value(domNode) {
    return domNode.querySelector("div.ql-tweet").dataset.url;
  }

  static sanitize(url) {
=======
  static value(domNode: HTMLDivElement) {
    return (domNode.querySelector("div.ql-tweet") as HTMLDivElement).dataset
      .url;
  }

  static sanitize(url: string) {
>>>>>>> 6f9e6e5375231e5818c50358cb85979ee8cad4bc
    console.log(url);
    if (url.indexOf("?") !== -1) {
      url = url.substring(0, url.indexOf("?"));
    }
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }
}

TweetEmbed.blotName = "tweet";
TweetEmbed.tagName = "div";
TweetEmbed.className = "ql-tweet";

export default TweetEmbed;
