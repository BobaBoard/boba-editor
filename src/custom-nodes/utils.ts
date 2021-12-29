import {
  loadTemplateFromString,
  loadTemplateFromTemplateNode,
} from "./utils/template-utils";

import CloseButton from "../img/close.svg";
import EmbedOverlayHtml from "./templates/EmbedOverlay.html";
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

const createOptionNode = (
  embedOverlay: HTMLElement,
  settings: {
    icon: string;
    initialActive: boolean;
    getAriaLabel: (active: boolean) => string;
    onToggle: (active: boolean) => void;
  }
) => {
  const optionButton = loadTemplateFromTemplateNode(
    embedOverlay.querySelector<HTMLTemplateElement>(".option-template")!
  );
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

  return optionButton;
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
            // TODO: should this go here?
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
