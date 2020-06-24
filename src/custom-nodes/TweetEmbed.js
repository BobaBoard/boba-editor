import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");

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
    // Allow twitter library to modify our contents
    window?.twttr?.widgets
      ?.createTweet(id, node, TweetEmbed.tweetOptions)
      .then((el) => {
        node.classList.remove("loading");
        node.dataset.rendered = true;
        // Remove loading message
        if (node.childNodes.length > 1) {
          node.removeChild(node.childNodes[0]);
        }
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
    if (!window?.twttr?.widgets) {
      if (!attemptsRemaining) {
        node.classList.add("error");
        node.innerHTML = "This tweet.... it dead.";
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
    var tweets = document.querySelectorAll("div.ql-tweet");
    for (var i = 0; i < tweets.length; i++) {
      while (tweets[i].firstChild) {
        tweets[i].removeChild(tweets[i].firstChild);
      }
      TweetEmbed.loadTweet(tweets[i].dataset.id, tweets[i]);
    }
  }

  static create(value) {
    let node = super.create();
    let url = this.sanitize(value);
    let id = url.substr(url.lastIndexOf("/") + 1);
    node.dataset.url = url;
    node.contentEditable = false;
    node.dataset.id = id;
    node.dataset.rendered = false;
    node.classList.add("tweet", "loading");
    node.innerHTML = "Preparing to chirp...";
    TweetEmbed.loadTweet(id, node);
    return node;
  }

  static setOnLoadCallback(callback) {
    TweetEmbed.onLoadCallback = callback;
  }

  static value(domNode) {
    return domNode.dataset.url;
  }

  static sanitize(url) {
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
