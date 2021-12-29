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

const stripEmptyTextNodes = (templateRoot: HTMLElement) => {
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

const createOptionNode = (
  embedOverlay: HTMLElement,
  settings: {
    icon: string;
    initialActive: boolean;
    getAriaLabel: (active: boolean) => string;
    onToggle: (active: boolean) => void;
  }
) => {
  const optionButton = embedOverlay
    .querySelector<HTMLTemplateElement>(".option-template")
    ?.content.querySelector("button")
    ?.cloneNode(true) as HTMLElement;
  const optionButtonImg = optionButton.querySelector("img") as HTMLImageElement;
  optionButtonImg.src = settings.icon;
  optionButton.classList.toggle("active", settings.initialActive);
  optionButton.setAttribute(
    "aria-label",
    settings.getAriaLabel(settings.initialActive)
  );
  optionButton.addEventListener("click", (e) => {
    const active = optionButton.classList.toggle("active");
    settings.onToggle(active);
    optionButton.setAttribute("aria-label", settings.getAriaLabel(active));
    e.stopPropagation();
    e.preventDefault();
  });

  return stripEmptyTextNodes(optionButton);
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
  const embedOverlay = loadTemplateFromString(EmbedOverlayHtml);
  const optionsOverlay = embedOverlay.querySelector(
    ".options-overlay"
  ) as HTMLElement;
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
      const hasSpoilers = !!embedType.value(embedRoot).spoilers;
      optionsOverlay.appendChild(
        createOptionNode(embedOverlay, {
          icon: SpoilersIcon,
          initialActive: hasSpoilers,
          getAriaLabel: (active) => `Toggle spoilers ${active ? "off" : "on"}`,
          onToggle: (active) => {
            embedType.onMarkSpoilers?.(embedRoot, active);
            embedOverlay.classList.toggle("spoilers", active);
          },
        })
      );

      // TODO: should this go here?
      embedOverlay.classList.toggle("spoilers", hasSpoilers);
    }

    // TODO: add extra settings and don't toggle spoilers when clicking on
    // element if we're in edit mode

    extraSettings?.forEach((setting) => {
      optionsOverlay.appendChild(
        createOptionNode(embedOverlay, {
          ...setting,
          initialActive: setting.initialValue,
          // TODO: fill aria label
          getAriaLabel: () => ``,
          onToggle: (active) => setting.onToggle(embedRoot, active),
        })
      );
    });
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
  const templateElement = loadTemplateFromString(template);
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

export const loadTemplateFromString = (template: string) => {
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

  return stripEmptyTextNodes(templateRoot);
};
