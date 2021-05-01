import { BlockImage } from "./custom-nodes/ssr";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { RefObject } from "react";
import InlineSpoilers from "./custom-nodes/InlineSpoilers";
import BlockImageType from "./custom-nodes/BlockImage";
import { makeSpoilerable } from "./custom-nodes/utils";

export const attachEventListeners = (ssrRef: RefObject<HTMLDivElement>) => {
  const spoilers = ssrRef.current?.querySelectorAll(".inline-spoilers");
  spoilers?.forEach((node) =>
    InlineSpoilers.addEventListeners(node as HTMLElement)
  );
  const imageSpoilers = ssrRef.current?.querySelectorAll(
    ".ql-block-image.spoilers"
  );
  imageSpoilers?.forEach((node) =>
    makeSpoilerable(BlockImageType, node as HTMLElement, {
      spoilers: true,
    })
  );
};

export const getSsrConverter = () => {
  return {
    // InitialText is a quill ops array
    convert: (initialText: any[]) => {
      const textWithBlockRendering = initialText.map((op: any) => {
        const blockImage = op.insert["block-image"];
        if (blockImage) {
          return {
            ...op,
            attributes: { renderAsBlock: true },
          };
        }
        return op;
      });

      const converter = new QuillDeltaToHtmlConverter(textWithBlockRendering, {
        multiLineParagraph: false,
        multiLineBlockquote: false,
        customCssClasses: (ops) => {
          if (ops.insert.type == "text" && ops.attributes["code-block"]) {
            return "ql-syntax";
          }
          if (ops.insert.type == "text" && ops.attributes["inline-spoilers"]) {
            return "inline-spoilers";
          }
          return;
        },
      });
      converter.renderCustomWith(function (customOp, contextOp) {
        if (customOp.insert.type === "block-image") {
          const value = customOp.insert.value;
          return BlockImage(value);
        } else {
          // We try to be neutral with other custom blots.
          return "<div />";
        }
      });
      converter.afterRender(function (groupType, htmlString) {
        // Add the empty paragraph class to empty paragraphs.
        return (
          // @ts-ignore
          htmlString.replaceAll?.(
            "<p><br/></p>",
            '<p class="empty"><br/></p>'
          ) || htmlString
        );
      });

      return converter.convert();
    },
  };
};
