export const addEmbedOverlay = (embedRoot: HTMLDivElement) => {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("embed-container");
  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  containerDiv.appendChild(embedRoot);
  containerDiv.appendChild(closeButton);

  return containerDiv;
};
