import {
  loadTemplateFromString,
  loadTemplateFromTemplateNode,
} from "../utils/template-utils";

import CloseButton from "../../img/close.svg";
import EmbedOverlayHtml from "../templates/EmbedOverlay.html";
import SpoilersIcon from "../../img/spoilers.svg";

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
