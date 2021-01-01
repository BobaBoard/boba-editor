import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

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
          return;
        },
      });
      converter.renderCustomWith(function (customOp, contextOp) {
        if (customOp.insert.type === "block-image") {
          const value = customOp.insert.value;
          // TODO: try moving this closer to the BlockImage class.
          return `<div class="block-image-class ql-block-image ql-embed" contenteditable="false"><img src="${value.src}" width="${value.width}px" height="${value.height}px" /></div>`;
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
