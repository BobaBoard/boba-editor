import React from "react";
import ReactDOM from "react-dom";
// @ts-ignore
import CloseButton from "../img/close.svg";

const logging = require("debug")("bobapost:embeds:utils");

export const addEmbedOverlay = (
  embedRoot: HTMLElement,
  callbacks: {
    onClose: (root: HTMLElement) => void;
  }
) => {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("embed-overlay");
  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  ReactDOM.render(React.createElement(CloseButton, {}, null), closeButton);
  containerDiv.appendChild(closeButton);

  closeButton.addEventListener("click", () => {
    callbacks.onClose(embedRoot);
  });

  embedRoot.appendChild(containerDiv);
  return embedRoot;
};

export const addLoadingMessage = (
  embedRoot: HTMLElement,
  {
    message,
    url,
  }: {
    message: string;
    url: string;
  }
) => {
  const loadingMessage = document.createElement("div");
  const linkToOriginal = document.createElement("a");
  linkToOriginal.innerHTML = message;
  linkToOriginal.href = url;
  loadingMessage.appendChild(linkToOriginal);
  loadingMessage.classList.add("loading-message");

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
    url: string;
  }
) => {
  const loadingMessage = document.createElement("div");
  const linkToOriginal = document.createElement("a");
  linkToOriginal.innerHTML = message;
  linkToOriginal.href = url;
  loadingMessage.appendChild(linkToOriginal);
  loadingMessage.classList.add("error-message");

  embedRoot.appendChild(loadingMessage);

  return embedRoot;
};
