import type { SavedValue as BlockImageSavedValue } from "./BlockImage";
export const BlockImage = (savedValue: BlockImageSavedValue) => {
  const value = {
    src: typeof savedValue === "string" ? savedValue : savedValue.src,
    width: typeof savedValue === "string" ? undefined : savedValue.width + "px",
    height:
      typeof savedValue === "string" ? undefined : savedValue.height + "px",
    spoilers: typeof savedValue === "string" ? false : savedValue.spoilers,
  };
  const spoilersBlock = `<div class="embed-overlay" style="width:100%;height:${value.height};"></div>`;
  const imageBlock = `<img src="${value.src}" ${
    value.width && `width="${value.width}"`
  } ${value.height && `height="${value.height}"`} />`;
  return `<div class="block-image-class ql-block-image ql-embed${
    value.spoilers ? " spoilers" : ""
  }" contenteditable="false">${
    value.spoilers ? spoilersBlock : ""
  }${imageBlock}</div>`;
};
