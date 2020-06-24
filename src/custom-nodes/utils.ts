export const addEmbedOverlay = (
  embedRoot: HTMLElement,
  callbacks: {
    onClose: (root: HTMLDivElement) => void;
  }
) => {
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("embed-container");
  const closeButton = document.createElement("div");
  closeButton.classList.add("close-button");

  containerDiv.appendChild(embedRoot);
  containerDiv.appendChild(closeButton);

  closeButton.addEventListener("click", () => {
    callbacks.onClose(containerDiv);
  });

  return containerDiv;
};
