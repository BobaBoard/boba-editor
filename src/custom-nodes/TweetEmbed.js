import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

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
      console.log("setting timeout for tweet load");
      setTimeout(
        () => TweetEmbed.loadTweet(id, node, attemptsRemaining - 1),
        50
      );
    }
  }

  static icon() {
    // TODO: maybe inlining this isn't the greatest idea, but it works.
    return '<svg viewBox="0 0 275 275" xmlns="http://www.w3.org/2000/svg"><path d="M91.1 239c94.4 0 146-78 146-145.8 0-2.3 0-4.5-.2-6.7 10-7.2 18.7-16.2 25.6-26.5-9.4 4.1-19.3 6.8-29.5 8a51.5 51.5 0 0 0 22.6-28.3c-10 6-21 10.2-32.6 12.4A51.3 51.3 0 0 0 135.6 99C94.4 96.9 56 77.4 30 45.3a51.3 51.3 0 0 0 15.9 68.5 51 51 0 0 1-23.3-6.4v.6a51.3 51.3 0 0 0 41.1 50.3c-7.5 2-15.4 2.4-23.1.9a51.3 51.3 0 0 0 48 35.6 103 103 0 0 1-76 21.3c23.5 15 50.7 23 78.6 23" class="ql-fill" fill-rule="nonzero"/></svg>';
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

Icon["tweet"] = TweetEmbed.icon();

export default TweetEmbed;
