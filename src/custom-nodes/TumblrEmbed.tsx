import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");
const Link = Quill.import("formats/link");
const Icon = Quill.import("ui/icons");

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

  static loadPost(node, data) {
    let tumblrNode = document.createElement("div");
    tumblrNode.classList.add("tumblr-post");
    // Add this to the post for rendering, but
    // also to the node for value retrieval
    tumblrNode.dataset.href = data.href;
    tumblrNode.dataset.did = data.did;
    tumblrNode.dataset.url = data.url;
    node.dataset.href = data.href;
    node.dataset.did = data.did;
    node.dataset.url = data.url;
    let a = document.createElement("a");
    a.href = data.url;
    a.innerText = data.url;
    tumblrNode.appendChild(a);
    node.innerHTML = "";
    node.appendChild(tumblrNode);
    let fileref = document.createElement("script");
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("async", "");
    fileref.setAttribute("src", "https://assets.tumblr.com/post.js");
    document.body.appendChild(fileref);
  }

  static renderFromUrl(url: string) {
    let node = super.create();
    if (!url) {
      // TODO: make a decent error here
      return;
    }

    node.contentEditable = false;
    node.dataset.rendered = false;
    node.classList.add("tumblr", "loading");
    node.innerHTML = "Fetching female-presenting nipples...";

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
    if (typeof value == "string") {
      return TumblrEmbed.renderFromUrl(this.sanitize(value));
    }
    let node = super.create();
    TumblrEmbed.loadPost(node, value);
    return node;
  }

  static setOnLoadCallback(callback: () => void) {
    // TODO: implement this
    TumblrEmbed.onLoadCallback = callback;
  }

  static value(domNode: HTMLDivElement) {
    return {
      href: domNode.dataset.href,
      did: domNode.dataset.did,
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

TumblrEmbed.blotName = "tumblr-embed";
TumblrEmbed.tagName = "div";
TumblrEmbed.className = "ql-tumblr-embed";

Icon["tumblr"] = TumblrEmbed.icon();

export default TumblrEmbed;
