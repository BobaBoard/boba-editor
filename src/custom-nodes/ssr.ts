import {
  EmbedValue,
  TumblrEmbedValue,
  TweetEmbed as TweetEmbedInterface,
} from "../config";

import type { SavedValue as BlockImageSavedValue } from "./BlockImage";
import OEmbedSsrTemplate from "./templates/OEmbedSSR.html";
import type { HTMLElement as ParserHTMLElement } from "node-html-parser";
import type Quill from "quill";
import React from "react";
import TumblrSsrTemplate from "./templates/TumblrSSR.html";
import TweetEmbedComponent from "./components/Twitter";
import { parse } from "node-html-parser";
import { renderToString } from "react-dom/server";

export const BlockImage = (savedValue: BlockImageSavedValue) => {
  const value = {
    src: typeof savedValue === "string" ? savedValue : savedValue.src,
    width: typeof savedValue === "string" ? undefined : savedValue.width + "px",
    height:
      typeof savedValue === "string" ? undefined : savedValue.height + "px",
    spoilers: typeof savedValue === "string" ? false : savedValue.spoilers,
  };
  const spoilersBlock = `<div class="embed-overlay" style="width:100%;"></div>`;
  const imageBlock = `<img src="${value.src}" ${
    value.width && `width="${value.width}"`
  } ${value.height && `height="${value.height}"`} />`;
  return `<div class="block-image-class ql-block-image ql-embed${
    value.spoilers ? " spoilers" : ""
  }" contenteditable="false">${
    value.spoilers ? spoilersBlock : ""
  }${imageBlock}</div>`;
};

export class FakeInlineModule {
  static order = [];
  constructor(domNode: HTMLElement) {}
  formats(domNode: HTMLElement) {}
  optimize(context: any) {}
}

/**
 * Imports a Quill module in a SSR-safe way (i.e. without importing Quill server-side).
 *
 * NOTE: this has been only tested on inline modules. Use with caution.
 * NOTE2: In case of circular imports, this will cause errors during rendering.
 */
export const importQuillModule = (moduleName: string) => {
  let QuillModule: typeof Quill;
  if (typeof window !== "undefined") {
    QuillModule = require("quill") as typeof Quill;
  } else {
    QuillModule = { import: () => FakeInlineModule } as any as typeof Quill;
  }
  return QuillModule.import(moduleName);
};

// TODO: figurte out why we aren't using the one in utils.ts for this.
export const makeSpoilerable = (
  embedType: any,
  embedRoot: HTMLElement,
  embedValue: { spoilers?: boolean } | any
) => {
  const isSpoilered =
    embedType.value?.(embedRoot)?.["spoilers"] || embedValue.spoilers;
  embedRoot.addEventListener("click", () => {
    embedRoot.classList.toggle("show-spoilers");
  });
  if (isSpoilered) {
    embedRoot?.classList.toggle("spoilers", isSpoilered);
    embedRoot?.classList.remove("show-spoilers");
    embedRoot?.setAttribute("data-spoilers", "true");
  }
  if (!embedType.onMarkSpoilers) {
    embedType.onMarkSpoilers = (node: HTMLDivElement, spoilers: boolean) => {
      if (spoilers) {
        node.setAttribute("data-spoilers", "true");
      } else {
        node.removeAttribute("data-spoilers");
        node?.classList.toggle("spoilers", spoilers);
      }
    };
  }
  if (!embedType.spoilersAugmented) {
    const previousValue = embedType.value;
    embedType.value = (domNode: HTMLElement) => {
      const value = previousValue(domNode);
      const spoilers = domNode.getAttribute("data-spoilers");
      return {
        ...value,
        spoilers: !!spoilers,
      };
    };

    const previousHash = embedType.getHashForCache;
    embedType.getHashForCache = (value: { spoilers?: boolean } | any) => {
      const hash = previousHash(value);
      return hash + (value?.spoilers ? "_spoilers" : "");
    };
    embedType.spoilersAugmented = true;
  }
};

// TODO: add sanitizer to strings
const getTweetValues = (
  value: string | EmbedValue | TweetEmbedInterface
): TweetEmbedInterface => {
  if (typeof value === "string") {
    const url = new URL(value);
    return {
      url: value,
      href: value,
      did: url.pathname.substr(url.pathname.lastIndexOf("/") + 1),
    };
  }
  const url = new URL(value.url);
  return {
    url: value.url,
    href: value.url,
    embedWidth: value.embedWidth,
    embedHeight: value.embedHeight,
    did: url.pathname.substr(url.pathname.lastIndexOf("/") + 1),
    spoilers: value.spoilers,
    thread: "thread" in value ? value.thread : undefined,
  };
};

// TODO: add sanitizer to strings
const getTumblrValues = (value: string | EmbedValue | TumblrEmbedValue) => {
  if (typeof value === "string") {
    return {
      url: value,
    };
  }
  return {
    url: value.url,
    embedWidth: value.embedWidth,
    embedHeight: value.embedHeight,
    spoilers: value.spoilers,
    href: "href" in value ? value.href : undefined,
    did: "did" in value ? value.did : undefined,
  };
};

// TODO: add sanitizer to strings
const getOEmbedValues = (value: string | EmbedValue) => {
  if (typeof value === "string") {
    return {
      url: value,
    };
  }
  return {
    url: value.url,
    embedWidth: value.embedWidth,
    embedHeight: value.embedHeight,
    spoilers: value.spoilers,
  };
};

const setOrRemoveAttribute = (
  node: ParserHTMLElement | null,
  attribute: string,
  value: string | undefined
) => {
  if (!node) {
    return;
  }
  if (typeof value !== "undefined") {
    node.setAttribute(attribute, value);
  } else {
    node.removeAttribute(attribute);
  }
};

export const TweetEmbed = (
  value: string | EmbedValue | TweetEmbedInterface
) => {
  const tweetValues = getTweetValues(value);
  return `<div class="ql-tweet">${renderToString(
    React.createElement(TweetEmbedComponent, { value: tweetValues })
  )}</div>`;
  // const template = TwitterSsrTemplate;
  // const node = parse(template);
  // node.setAttribute("data-url", tweetValues.href);
  // node.setAttribute("data-id", tweetValues.did);
  // setOrRemoveAttribute(node, "data-embed-width", tweetValues.embedWidth);
  // setOrRemoveAttribute(node, "data-embed-height", tweetValues.embedHeight);
  // node
  //   .querySelector(".loading-message a")
  //   ?.setAttribute("href", tweetValues.href);
  // const loadingMessage = node.querySelector(".loading-message");
  // if (loadingMessage && tweetValues.embedHeight && tweetValues.embedWidth) {
  //   const ratio =
  //     (parseInt(tweetValues.embedHeight) / parseInt(tweetValues.embedWidth)) *
  //     100;
  //   loadingMessage.setAttribute("style", `padding-top: ${ratio}%`);
  // }

  // return node.removeWhitespace().toString();
};

export const TumblrEmbed = (value: string | EmbedValue | TumblrEmbedValue) => {
  const tumblrValues = getTumblrValues(value);
  const template = TumblrSsrTemplate;
  const node = parse(template);
  setOrRemoveAttribute(node, "data-url", tumblrValues.href);
  setOrRemoveAttribute(node, "data-id", tumblrValues.did);
  setOrRemoveAttribute(node, "data-embed-width", tumblrValues.embedWidth);
  setOrRemoveAttribute(node, "data-embed-height", tumblrValues.embedHeight);
  setOrRemoveAttribute(node, "data-id", tumblrValues.href);
  setOrRemoveAttribute(
    node.querySelector(".loading-message a"),
    "href",
    tumblrValues.url
  );
  const loadingMessage = node.querySelector(".loading-message");
  if (loadingMessage && tumblrValues.embedHeight && tumblrValues.embedWidth) {
    const ratio =
      (parseInt(tumblrValues.embedHeight) / parseInt(tumblrValues.embedWidth)) *
      100;
    loadingMessage.setAttribute("style", `padding-top: ${ratio}%`);
  }

  return node.removeWhitespace().toString();
};

export const OEmbedBase = (
  value: string | EmbedValue,
  settings: {
    extraClass?: string;
    loadingMessage: string;
    backgroundColor: string;
  }
) => {
  const oembedValues = getOEmbedValues(value);
  const template = OEmbedSsrTemplate;
  const node = parse(template);
  if (settings.extraClass) {
    node.classList.add(settings.extraClass);
  }
  setOrRemoveAttribute(node, "data-url", oembedValues.url);
  setOrRemoveAttribute(node, "data-embed-width", oembedValues.embedWidth);
  setOrRemoveAttribute(node, "data-embed-height", oembedValues.embedHeight);
  const loadingLink = node.querySelector(".loading-message a");
  setOrRemoveAttribute(loadingLink, "href", oembedValues.url);
  if (loadingLink) {
    loadingLink.innerHTML = settings.loadingMessage;
  }
  const loadingMessage = loadingLink?.parentNode;
  if (loadingMessage) {
    let style = `background-color: ${settings.backgroundColor};`;
    if (oembedValues.embedHeight && oembedValues.embedWidth) {
      const ratio =
        (parseInt(oembedValues.embedHeight) /
          parseInt(oembedValues.embedWidth)) *
        100;
      style += `padding-top: ${ratio}%`;
    }
    loadingMessage.setAttribute("style", style);
  }

  return node.removeWhitespace().toString();
};
