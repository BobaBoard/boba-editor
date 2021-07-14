import { BlockImage } from "./custom-nodes/ssr";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { RefObject } from "react";
import type Cheerio from "cheerio";
let CheerioModule: typeof Cheerio;
// window = undefined;
// document = undefined;
if (typeof window !== "undefined") {
  CheerioModule = require("cheerio") as typeof Cheerio;
}
import type {
  Node as CheerioNode,
  CheerioAPI,
  Element as CheerioElement,
} from "cheerio";
import { addEventListeners as addSpoilersEventListeners } from "./custom-nodes/InlineSpoilers";
// import BlockImageType from "./custom-nodes/BlockImage";
import { makeSpoilerable } from "./custom-nodes/utils";

const isSpoilerNode = (node: CheerioNode | null, $: CheerioAPI) => {
  if (!node) {
    return false;
  }
  if (node.nodeType == Node.ELEMENT_NODE) {
    return $(node).hasClass("inline-spoilers");
  }
  return false;
};

const compactSpoilers = (finalHtml: string) => {
  const dom = CheerioModule.load(finalHtml, null, false);
  const inlineSpoilers = dom(".inline-spoilers").toArray();
  const inlineSpoilerGroups = inlineSpoilers
    // Get each separate group of inline spoilers
    .filter((elem) => {
      // Get inline spoilers not preceeded by other inline spoilers
      const previousElement = elem.previousSibling;
      const nextElement = elem.nextSibling;
      return (
        !isSpoilerNode(previousElement, dom) && isSpoilerNode(nextElement, dom)
      );
    })
    .map((elem) => {
      // ...And group it with all the adjacent ones
      const elements = [elem];
      let currentElement: CheerioNode = elem;
      while (
        currentElement.nextSibling &&
        isSpoilerNode(currentElement.nextSibling, dom)
      ) {
        // We can infer this is a CheerioElement cause spoilers nodes must be Elements
        elements.push(currentElement.nextSibling as CheerioElement);
        currentElement = currentElement.nextSibling;
      }
      return elements;
    });
  inlineSpoilerGroups.forEach((el) => {
    const firstElement = dom(el[0]);
    const lastElement = dom(el[el.length - 1]);
    const allSiblings = firstElement.parent().children();
    const firstIndex = allSiblings.index(firstElement);
    const lastIndex = allSiblings.index(lastElement);
    const newSpan = dom('<span class="inline-spoilers"></span>');
    allSiblings.each((index, elem) => {
      if (index < firstIndex || index > lastIndex) {
        return;
      }
      if (elem.tagName === "span") {
        newSpan.append(dom(elem).text());
      } else {
        const newElement = dom(elem).clone();
        newElement.removeClass("inline-spoilers");
        newSpan.append(newElement);
      }
    });
    newSpan.insertBefore(firstElement);
    el.forEach((el) => {
      dom(el).remove();
    });
  });
  return dom.root().html();
};

export const attachEventListeners = (ssrRef: RefObject<HTMLDivElement>) => {
  const spoilers = ssrRef.current?.querySelectorAll(".inline-spoilers");
  spoilers?.forEach((node) => addSpoilersEventListeners(node as HTMLElement));
  const imageSpoilers = ssrRef.current?.querySelectorAll(
    ".ql-block-image.spoilers"
  );
  imageSpoilers?.forEach((node) =>
    makeSpoilerable({}, node as HTMLElement, {
      spoilers: true,
    })
  );
};

export const getSsrConverter = () => {
  return {
    // InitialText is a quill ops array (sometimes)
    convert: (initialText: any) => {
      const actualDelta: any[] =
        "ops" in initialText ? initialText.ops : (initialText as any[]);
      const textWithBlockRendering =
        actualDelta.map((op: any) => {
          const blockImage = op.insert["block-image"];
          if (blockImage) {
            return {
              ...op,
              attributes: { renderAsBlock: true },
            };
          }
          return op;
        }) || [];

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
        let processedString = htmlString;
        if (
          groupType == "inline-group" &&
          processedString.indexOf("inline-spoilers") != -1
        ) {
          processedString = compactSpoilers(processedString) || processedString;
        }
        // Add the empty paragraph class to empty paragraphs.
        return (
          // @ts-ignore
          processedString.replaceAll?.(
            "<p><br/></p>",
            '<p class="empty"><br/></p>'
          ) || processedString
        );
      });

      return converter.convert();
    },
  };
};
