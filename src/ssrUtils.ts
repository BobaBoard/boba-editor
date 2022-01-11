import { BlockImage, TweetEmbed } from "./custom-nodes/ssr";
import { NodeType, parse } from "node-html-parser";
import type {
  HTMLElement as ParserHTMLElement,
  Node as ParserNode,
} from "node-html-parser";

import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { RefObject } from "react";
import { addEventListeners as addSpoilersEventListeners } from "./custom-nodes/InlineSpoilers";
// import BlockImageType from "./custom-nodes/BlockImage";
import { makeSpoilerable } from "./custom-nodes/utils";

const isSpoilerNode = (node: ParserNode | null): node is ParserHTMLElement => {
  if (!node || node.nodeType !== NodeType.ELEMENT_NODE) {
    return false;
  }
  return (node as ParserHTMLElement).classList.contains("inline-spoilers");
};

const mergeSpoilerGroup = (spoilerGroupElements: ParserHTMLElement[]) => {
  const firstElementOfGroup = spoilerGroupElements[0];
  const lastElementOfGroup =
    spoilerGroupElements[spoilerGroupElements.length - 1];
  const allElementSiblings = firstElementOfGroup.parentNode.childNodes.filter(
    (node: ParserNode): node is ParserHTMLElement =>
      node.nodeType === NodeType.ELEMENT_NODE
  );
  const firstIndex = allElementSiblings.findIndex(
    (node) => node == firstElementOfGroup
  );
  const lastIndex = allElementSiblings.findIndex(
    (node) => node == lastElementOfGroup
  );
  const newSpan = parse('<span class="inline-spoilers"></span>').querySelector(
    ".inline-spoilers"
  )!;
  allElementSiblings.forEach((elem, index) => {
    if (index < firstIndex || index > lastIndex) {
      return;
    }

    if (elem.tagName === "SPAN") {
      newSpan.appendChild(parse(elem.innerHTML));
    } else {
      const elementClone = parse(elem.toString())
        .firstChild as ParserHTMLElement;
      elementClone.classList.remove("inline-spoilers");
      newSpan.appendChild(elementClone);
    }
  });
  return newSpan;
};

const compactSpoilers = (finalHtml: string) => {
  const editorContent = parse(finalHtml);
  const inlineSpoilers = editorContent.querySelectorAll(".inline-spoilers");
  const inlineSpoilerGroups = inlineSpoilers
    // Get each separate group of inline spoilers
    .filter((elem) => {
      // Get the first inline spoiler for each group of inline spoiler siblings
      if (!isSpoilerNode(elem.nextSibling)) {
        return false;
      }
      const elementIndexInParent = elem.parentNode.childNodes.findIndex(
        (child) => elem == child
      );
      const previousElement =
        elem.parentNode.childNodes[elementIndexInParent - 1];
      return !isSpoilerNode(previousElement);
    })
    .map((elem) => {
      // ...And group it with all the adjacent ones
      const elements = [elem];
      let currentElement: ParserHTMLElement = elem;
      while (
        currentElement.nextSibling &&
        isSpoilerNode(currentElement.nextSibling)
      ) {
        elements.push(currentElement.nextSibling);
        currentElement = currentElement.nextSibling;
      }
      return elements;
    });
  inlineSpoilerGroups.forEach((group) => {
    const mergedSpan = mergeSpoilerGroup(group);
    group[0].parentNode.exchangeChild(group[0], mergedSpan);
    group.forEach((element, index) => {
      if (index == 0) {
        return;
      }
      element.remove();
    });
  });
  return editorContent.toString();
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
        } else if (customOp.insert.type === "tweet") {
          return TweetEmbed(customOp.insert.value as any);
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
          processedString
            // @ts-ignore
            .replaceAll?.("<p><br></p>", '<p class="empty"><br/></p>')
            // @ts-ignore
            .replaceAll?.("<p><br/></p>", '<p class="empty"><br/></p>') ||
          processedString
        );
      });

      return converter.convert();
    },
  };
};
