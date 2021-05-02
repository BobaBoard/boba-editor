import React from "react";
import ReactDOM from "react-dom";
// @ts-ignore
import CloseButton from "../img/close.svg";
// @ts-ignore
import SpoilersIcon from "../img/spoilers.svg";

const logging = require("debug")("bobapost:embeds:utils");

// NOTE/TODO
// Spoilers won't work when switching from editable to non-editable without unmounting
// the embed, and when editing something already marked as a spoiler.
// This is not a problem for now but will need to be addressed in the future.
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
  }
  if (!embedType.onMarkSpoilers) {
    embedType.onMarkSpoilers = (node: HTMLDivElement, spoilers: boolean) => {
      if (spoilers) {
        node.setAttribute("spoilers", "true");
      } else {
        node.removeAttribute("spoilers");
      }
    };
  }
  if (!embedType.spoilersAugmented) {
    const previousValue = embedType.value;
    embedType.value = (domNode: HTMLElement) => {
      const value = previousValue(domNode);
      const spoilers = domNode.getAttribute("spoilers");
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

export const addEmbedEditOverlay = (
  embedType: any,
  embedRoot: HTMLElement,
  extraSettings?: {
    icon: any;
    initialValue: boolean;
    onToggle: (root: HTMLElement, value: boolean) => void;
  }[]
) => {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("embed-overlay");
  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  ReactDOM.render(React.createElement(CloseButton, {}, null), closeButton);
  containerDiv.appendChild(closeButton);
  closeButton.addEventListener("click", () => {
    embedType.onRemoveRequest(embedRoot);
  });

  const hasOption = embedType.onMarkSpoilers || extraSettings?.length;
  if (hasOption) {
    const optionsOverlay = document.createElement("div");
    optionsOverlay.classList.add("options-overlay");
    if (embedType.onMarkSpoilers) {
      const spoilersButton = document.createElement("div");
      spoilersButton.classList.add("spoilers-button", "embed-options-button");
      ReactDOM.render(
        React.createElement(SpoilersIcon, {}, null),
        spoilersButton
      );
      optionsOverlay.appendChild(spoilersButton);
      spoilersButton.classList.toggle(
        "active",
        !!embedType.value(embedRoot).spoilers
      );
      containerDiv.classList.toggle(
        "spoilers",
        !!embedType.value(embedRoot).spoilers
      );
      spoilersButton.addEventListener("click", (e) => {
        spoilersButton.classList.toggle("active");
        embedType.onMarkSpoilers?.(
          embedRoot,
          spoilersButton.classList.contains("active")
        );
        containerDiv.classList.toggle(
          "spoilers",
          spoilersButton.classList.contains("active")
        );
        e.stopPropagation();
        e.preventDefault();
      });
    }
    extraSettings?.forEach((setting) => {
      const threadButton = document.createElement("div");
      threadButton.classList.add("thread-button", "embed-options-button");
      ReactDOM.render(
        React.createElement(setting.icon, {}, null),
        threadButton
      );
      optionsOverlay.appendChild(threadButton);
      threadButton.classList.toggle("active", !!setting.initialValue);
      threadButton.addEventListener("click", (e) => {
        threadButton.classList.toggle("active");
        setting.onToggle(embedRoot, threadButton.classList.contains("active"));
        e.stopPropagation();
        e.preventDefault();
      });
    });

    containerDiv.appendChild(optionsOverlay);
  }

  embedRoot.appendChild(containerDiv);
  return embedRoot;
};

export const addLoadingMessage = (
  embedRoot: HTMLElement,
  {
    color,
    message,
    url,
    width,
    height,
  }: {
    color?: string;
    message?: string;
    url: string;
    width?: string;
    height?: string;
  }
) => {
  const loadingMessage = document.createElement("div");
  const linkToOriginal = document.createElement("a");
  linkToOriginal.innerHTML = message || "Loading...";
  linkToOriginal.href = url;
  loadingMessage.appendChild(linkToOriginal);
  loadingMessage.classList.add("loading-message");
  if (color) {
    loadingMessage.style.backgroundColor = color;
  }
  if (width && height) {
    const ratio = (parseInt(height) / parseInt(width)) * 100;
    logging(ratio);
    loadingMessage.style.paddingTop = `${ratio}%`;
  }

  embedRoot.appendChild(loadingMessage);

  return embedRoot;
};

export const addErrorMessage = (
  embedRoot: HTMLElement,
  {
    message,
    url,
  }: {
    message: string;
    url?: string;
  }
) => {
  const loadingMessage = document.createElement("div");
  if (url) {
    const linkToOriginal = document.createElement("a");
    linkToOriginal.innerHTML = message;
    linkToOriginal.href = url;
    loadingMessage.appendChild(linkToOriginal);
  } else {
    loadingMessage.innerHTML = message;
  }
  loadingMessage.classList.add("error-message");

  embedRoot.appendChild(loadingMessage);

  return embedRoot;
};
