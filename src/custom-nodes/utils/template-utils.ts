import invariant from "tiny-invariant";

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
      templateNode.content.firstElementChild,
    "No child element (or multiple elements) found in template."
  );
  const templateRoot = templateNode.content.firstElementChild as HTMLElement;

  // Remove all empty text nodes
  // TODO: this should be done through the html-loader config
  return stripEmptyTextNodes(templateRoot);
};

export const loadTemplateFromTemplateNode = (
  templateNode: HTMLTemplateElement
) => {
  invariant(templateNode, "template node is not valid HTMLTemplateElement");
  const templateRoot = templateNode?.content.firstElementChild?.cloneNode(
    true
  ) as HTMLElement;
  return stripEmptyTextNodes(templateRoot);
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
