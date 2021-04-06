import css from "styled-jsx/css";
export const globalStyles = css.global`
  .ql-embed.loading a {
    color: white !important;
  }
  .ql-embed .error-message {
    width: 100%;
    background-color: rgb(255, 15, 75);
    text-align: center;
    line-height: 25px;
    color: white;
    padding: 10px;
    margin: 10px 0;
  }
  .ql-embed .error-message a {
    color: white !important;
  }
  .ql-embed.ios-bug .error-message {
    width: 100%;
    height: 150px;
    background-color: black;
    text-align: center;
    line-height: 25px;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Ubuntu, "Helvetica Neue", sans-serif;
    padding: 20px;
    margin: 10px 0;
  }
  .ql-embed.ios-bug > svg {
    position: absolute;
    width: 50px;
    left: 10px;
    top: 10px;
  }
  .tweet .loading-message {
    width: 100%;
    min-height: 50px;
    background-color: #1da1f2;
    margin: 10px 0;
    text-align: center;
    line-height: 50px;
    color: white;
    position: relative;
  }
  .twitter-tweet-rendered {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    background-color: black;
  }
  .ql-embed {
    text-align: center;
    position: relative;
  }
  .ql-tiktok-embed {
    color: black;
    text-align: left;
  }
  .ql-tiktok-embed *:not(p) > a[title] {
    font-weight: bold;
  }
  .ql-embed:not(.ql-tiktok-embed) a {
    color: white;
    cursor: pointer;
  }
  .ql-embed:not(.ql-tiktok-embed) a:hover {
    color: white;
    cursor: pointer;
  }
  .ql-block-image {
    text-align: center;
    margin: 2px 0;
    obejct-fit: contain;
    height: auto;
  }
  .ql-block-image img {
    max-width: 100%;
    height: auto;
    obejct-fit: contain;
  }
  .ql-block-image.loading {
    width: 100%;
    min-height: 100px;
  }
  .ql-block-image.loading .spinner {
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);
  }
  .ql-block-image.error {
    width: 100%;
    height: 100px;
    background-color: red;
    content: "Error! Error!";
    color: white;
    text-align: center;
  }
  .ql-block-image.error::after {
    content: "Error! Error!";
    color: white;
    text-align: center;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
  .ql-youtube-video.loading {
    background-color: #ff0000;
  }
  .ql-youtube-video {
    text-align: center;
    margin: 10px 0;
  }
  .ql-youtube-video iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .ql-tiktok-embed.loading {
    background-color: aquamarine;
    padding: 30px;
    text-align: center;
    color: white;
    height: 80px;
    /*
   * Figure out how to readd overflow hidden to this
   */
  }
  blockquote.tiktok-embed {
    margin: 0 auto !important;
    padding: 0 !important;
    border: none!important;
  }
  .ql-youtube-video .loading-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .ql-tiktok-embed.loading .loading-message {
    position: relative;
    margin-bottom: 50px;
  }
  .tiktok-video {
    white-space: normal;
  }
  .tiktok-video) :global(blockquote {
    border-left: 0 !important;
    padding: 0 !important;
  }
  .ql-tumblr-embed.loading {
    background-color: #34526f;
    text-align: center;
    color: white;
    min-height: 80px;
    /*
     * Figure out how to readd overflow hidden to this
     */
  }
  .ql-tumblr-embed iframe {
    margin: 3px auto !important;
  }
  .ql-tumblr-embed .loading-message {
    position: relative;
    margin-bottom: 50px;
  }
  .embed-overlay {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    pointer-events: none;
  }
  .close-button {
    width: 35px;
    height: 35px;
    background-color: #444;
    position: absolute;
    border: 3px solid #ccc;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    border-radius: 50%;
    pointer-events: all;
    z-index: 2;
  }
  .close-button svg {
    fill: #ccc;
    top: 50%;
    left: 50%;
    display: block;
    position: absolute;
    transform: translate(-50%, -50%);
  }
  .close-button:hover svg, .close-button:hover {
    fill: white;
    border-color: white;
    cursor: pointer;
  }
  .options-button {
    width: 20px;
    height: 12px;
    background-color: #444;
    position: absolute;
    bottom: 0px;
    right: 0;
    border-bottom-left-radius: 5px;
    border-top-left-radius: 5px;
    pointer-events: all;
    z-index: 2;
  }
  .options-button svg {
    fill: #ccc;
    top: 50%;
    left: 50%;
    display: block;
    position: absolute;
    transform: translate(calc(-50% + 1px),calc(-50% - 1px));
    width: 26px;
    height: 20px;
  }
  .options-button:hover svg, .options-button:hover {
    fill: white;
    border-color: white;
    cursor: pointer;
  }
  .ql-block-image {
    background-color: #444;
  }
  .caption {
    color: white;
    font-size: small;
    padding-bottom: 2px;
  }
  .editor.view-only .close-button {
    display: none;
  }
  .inline-spoilers {
    padding: 1px;
    border: 1px dashed black;
    background-color: #e6dede;
  }
  .view-only .inline-spoilers:not(.visible) code {
    background-color: black !important;
  }
  .inline-spoilers:hover {
    cursor: pointer;
  }
  .inline-spoilers.visible {
  }
  .view-only .inline-spoilers {
    background-color: black;
  }
  .view-only .inline-spoilers:not(.visible), 
  .view-only .inline-spoilers:not(.visible) * {
    color: transparent !important;
    text-decoration-color: transparent !important;
  }
  .view-only .inline-spoilers.visible {
    background-color: transparent;
    color: inherit;
  }
  .view-only .options-overlay {
    display: none;
  }
  .options-overlay {
    display: flex;
    background-color: #444;
    max-width: 300px;
    border-radius: 15px;
    padding: 5px 15px;
    margin-top: 5px;
    pointer-events: all;
    z-index: 2;    
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .embed-options-button {
    height: 20px;
    width: 20px;
    margin: 0px 3px;
  }
  .embed-options-button.active .ql-fill {
    fill: white;
  }
  .embed-options-button:hover {
    cursor: pointer;
  }
  .embed-options-button > svg {
    height: 20px;
    width: 20px;
  }
  .view-only .spoilers .embed-overlay::after,
  .view-only .embed-overlay.spoilers::after {
    opacity: 1;
  }
  .view-only .spoilers .embed-overlay,
  .view-only .embed-overlay.spoilers {
    pointer-events: all;
  }
  .view-only .spoilers .embed-overlay:hover,
  .view-only .embed-overlay.spoilers:hover {
    cursor: pointer;
  }
  .spoilers .embed-overlay::after,
  .embed-overlay.spoilers::after {
    content: "";
    background-image: url(https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fadmin%2Fspoilers.png?alt=media&token=a343aee0-e90f-4379-8d41-1cac1f65f7ee);
    background-position: center;
    background-size: cover;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    opacity: 0.1;
    z-index: 3;
  }
  .view-only img.spoilers {
    visibility: hidden;
  }
  .view-only .show-spoilers img.spoilers {
    visibility: visible;
  }
  .spoilers.show-spoilers .embed-overlay::after,
  .show-spoilers .embed-overlay.spoilers::after {
    visibility: hidden;
  }
  .spoilers.show-spoilers .embed-overlay,
  .show-spoilers .embed-overlay.spoilers {
    display: none;
  }
  .show-spoilers img:hover {
    cursor: pointer;
  }
  .ql-oembed-embed {
    white-space: normal;
  }
  .ql-oembed-embed .embed-node.loading {
    visibility: hidden;
  }
  .ql-oembed-embed .loading-message,
  .ql-tumblr-embed .loading-message {
    width: 100%;
    height: 50px;
    margin: 10px 0;
    text-align: center;
    line-height: 50px;
    color: white;
    position: relative;
  }
  .ql-oembed-embed .loading-message a,
  .ql-tumblr-embed .loading-message a,
  .tweet .loading-message a {
    position: absolute !important;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .ql-oembed-embed.best-effort {
    background-color: #f5f5f5;
    border-radius: 10px;
    border: 1px solid #d0d0d0;
  }
  .ql-oembed-embed.best-effort img {
    border-radius: 10px 10px 0px 0px;
    width: 100%;
  }
  .ql-oembed-embed.best-effort .container.with-icon {
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 100%;
    background-size: 20px;
  }
  .ql-oembed-embed.best-effort h1 {
    font-size: 25px;
    text-decoration: underline;
  }
  .ql-oembed-embed.best-effort h1,
  .ql-oembed-embed.best-effort p {
    color: black;
  }
  .ql-oembed-embed.best-effort a {
    display: block;
    text-decoration: none;
  }
  .reddit-card a {
    color: black !important;
  }
`;
