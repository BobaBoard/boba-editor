import { loadTemplateFromString } from "./utils/template-utils";

const logging = require("debug")("bobapost:embeds:utils");

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
    embedRoot?.setAttribute("spoilers", "true");
  }
  if (!embedType.onMarkSpoilers) {
    embedType.onMarkSpoilers = (node: HTMLDivElement, spoilers: boolean) => {
      if (spoilers) {
        node.setAttribute("spoilers", "true");
      } else {
        node.removeAttribute("spoilers");
        node?.classList.toggle("spoilers", spoilers);
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
  const loadingMessage = loadTemplateFromString(
    `<div class="loading-message">
      <a>Loading...</a>
    </div>`
  );
  message && (loadingMessage.querySelector("a")!.innerHTML = message);
  loadingMessage.querySelector("a")!.href = url;
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
    width,
    height,
  }: {
    message: string;
    url?: string;
    width?: string;
    height?: string;
  }
) => {
  const errorMessage = loadTemplateFromString(
    `<div class="error-message">
      <a />
    </div>`
  );
  if (url) {
    errorMessage.querySelector("a")!.innerHTML = message;
    errorMessage.querySelector("a")!.href = url;
  } else {
    errorMessage.innerHTML = message;
  }
  if (width && height) {
    const ratio = (parseInt(height) / parseInt(width)) * 100;
    errorMessage.style.paddingTop = `${ratio}%`;
  }

  embedRoot.appendChild(errorMessage);

  return embedRoot;
};
