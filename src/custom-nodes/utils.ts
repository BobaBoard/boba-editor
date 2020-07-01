import React from "react";
import ReactDOM from "react-dom";
// @ts-ignore
import GifImage from "../img/close.svg";

const logging = require("debug")("bobapost:embeds:utils");

export const addEmbedOverlay = (
  embedRoot: HTMLElement,
  callbacks: {
    onClose: (root: HTMLDivElement) => void;
  }
) => {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("embed-container");
  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  ReactDOM.render(React.createElement(GifImage, {}, null), closeButton);
  containerDiv.appendChild(embedRoot);
  containerDiv.appendChild(closeButton);

  closeButton.addEventListener("click", () => {
    callbacks.onClose(containerDiv);
  });

  return containerDiv;
};

export const addLoadingMessage = (
  embedRoot: HTMLElement,
  {
    message,
    url,
  }: {
    message: string;
    backgroundColor: string;
    url: string;
  }
) => {
  const loadingMessage = document.createElement("p");
  const linkToOriginal = document.createElement("a");
  linkToOriginal.innerText = message;
  linkToOriginal.href = url;
  loadingMessage.appendChild(linkToOriginal);
  loadingMessage.classList.add("loading-message");

  embedRoot.appendChild(loadingMessage);
};
