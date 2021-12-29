import CloseButton from "../img/close.svg";
import EmbedOverlayHtml from "./templates/EmbedOverlay.html";
import SpoilersIcon from "../img/spoilers.svg";
import invariant from "tiny-invariant";

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
    icon: string;
    initialValue: boolean;
    onToggle: (root: HTMLElement, value: boolean) => void;
  }[]
) => {
  const embedOverlay = loadTemplate(EmbedOverlayHtml);
  const closeButtonImg = embedOverlay.querySelector(
    ".close-button img"
  ) as HTMLImageElement;
  const closeButton = embedOverlay.querySelector(
    ".close-button"
  ) as HTMLElement;

  // TODO: see about directly loading this from the html template
  closeButtonImg.src = CloseButton;
  closeButton.addEventListener("click", () => {
    embedType.onRemoveRequest(embedRoot);
  });

  const hasOption = embedType.onMarkSpoilers || extraSettings?.length;
  if (hasOption) {
    if (embedType.onMarkSpoilers) {
      const isSpoilered = !!embedType.value(embedRoot).spoilers;
      const spoilersButton = embedOverlay.querySelector(
        "button.spoilers-button"
      ) as HTMLButtonElement;
      const spoilersImg = embedOverlay.querySelector(
        "button.spoilers-button img"
      ) as HTMLImageElement;
      spoilersButton.setAttribute(
        "aria-label",
        `Toggle spoilers ${isSpoilered ? "off" : "on"}`
      );
      // TODO: see about directly loading this from the html template
      spoilersImg.src = SpoilersIcon;
      spoilersButton.classList.toggle("active", isSpoilered);
      embedOverlay.classList.toggle("spoilers", isSpoilered);
      spoilersButton.addEventListener("click", (e) => {
        const spoilersActive = spoilersButton.classList.toggle("active");
        embedType.onMarkSpoilers?.(embedRoot, spoilersActive);
        spoilersButton.setAttribute(
          "aria-label",
          `Toggle spoilers ${spoilersActive ? "off" : "on"}`
        );
        embedOverlay.classList.toggle("spoilers", spoilersActive);
        e.stopPropagation();
        e.preventDefault();
      });
    }

    // TODO: add extra settings and don't toggle spoilers when clicking on
    // element if we're in edit mode

    // extraSettings?.forEach((setting) => {
    //   const threadButton = document.createElement("div");
    //   threadButton.classList.add("thread-button", "embed-options-button");
    //   const threadButtonImg = document.createElement("img");
    //   threadButtonImg.src = setting.icon;
    //   threadButton.appendChild(threadButtonImg);
    //   optionsOverlay.appendChild(threadButton);
    //   threadButton.classList.toggle("active", !!setting.initialValue);
    //   threadButton.addEventListener("click", (e) => {
    //     threadButton.classList.toggle("active");
    //     setting.onToggle(embedRoot, threadButton.classList.contains("active"));
    //     e.stopPropagation();
    //     e.preventDefault();
    //   });
    // });
  }

  embedRoot.appendChild(embedOverlay);
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

export const loadTemplateInNode = (
  targetNode: HTMLElement,
  template: string
) => {
  const templateElement = loadTemplate(template);
  Array.from(templateElement.attributes).forEach((attribute) => {
    if (attribute.name == "class") {
      targetNode.classList.add(...Array.from(templateElement.classList));
      return;
    }
    targetNode.setAttribute(attribute.name, attribute.value);
  });
  templateElement.childNodes.forEach((node) => {
    targetNode.appendChild(node.cloneNode());
  });
};

export const loadTemplate = (template: string) => {
  const templateNode = document.createElement("template");
  templateNode.innerHTML = template.trim();
  invariant(
    templateNode.content.childElementCount === 1 &&
      templateNode.content.firstChild,
    "No child element (or multiple elements) found in template."
  );
  // Remove all empty text nodes
  // TODO: this should be done through the html-loader config
  const templateRoot = templateNode.content.firstChild as HTMLElement;

  const treeWalker = document.createTreeWalker(
    templateRoot,
    NodeFilter.SHOW_ALL
  );
  let currentNode: Node | null = treeWalker.currentNode;
  const toRemove: Node[] = [];

  // find all empty nodes
  while (currentNode) {
    if (currentNode.nodeType == Node.TEXT_NODE) {
      // TODO: figure out how to keep text nodes that have values
      toRemove.push(currentNode);
    }
    currentNode = treeWalker.nextNode();
  }
  toRemove.forEach((node) => {
    node.parentElement?.removeChild(node);
  });

  return templateRoot;
};
