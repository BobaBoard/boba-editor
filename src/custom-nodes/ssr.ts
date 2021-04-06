import type { SavedValue as BlockImageSavedValue } from "./BlockImage";
export const BlockImage = (value: BlockImageSavedValue) => {
  const spoilersBlock = `<div class="embed-overlay spoilers" style="width:100%;height:${value.height}px;"></div>`;
  const imageBlock = `<img src="${value.src}" width="${value.width}px" height="${value.height}px" />`;
  return `<div class="block-image-class ql-block-image ql-embed" contenteditable="false" style="height:min(auto,${
    value.height
  }px);"> ${value.spoilers ? spoilersBlock : imageBlock}</div>`;
};
