import React from "react";

export default (props: {}) => {
  return (
    <>
      <style jsx>{`
        :global(.ql-embed a) {
          color: white !important;
        }
        :global(.ql-embed .error-message) {
          width: 100%;
          height: 50px;
          background-color: red;
          text-align: center;
          line-height: 50px;
          color: white;
          margin: 10px 0;
        }
        :global(.ql-embed.ios-bug .error-message) {
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
        :global(.ql-embed.ios-bug > svg) {
          position: absolute;
          width: 50px;
          left: 10px;
          top: 10px;
        }
        :global(.tweet .loading-message) {
          width: 100%;
          min-height: 50px;
          background-color: #1da1f2;
          margin: 10px 0;
          text-align: center;
          line-height: 50px;
          color: white;
          position: relative;
        }
        :global(.twitter-tweet-rendered) {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
          background-color: black;
        }
        :global(.ql-embed.tweet) {
          text-align: center;
        }
        :global(.ql-embed) {
          position: relative;
        }
        :global(.ql-embed a) {
          color: white;
          cursor: pointer;
        }
        :global(.ql-embed a:hover) {
          color: white;
          cursor: pointer;
        }
        :global(.ql-block-image) {
          text-align: center;
          margin: 2px 0;
        }
        :global(.ql-block-image img) {
          max-width: 100%;
          height: auto;
        }
        :global(.ql-block-image.loading) {
          width: 100%;
          min-height: 100px;
        }
        :global(.ql-block-image.loading .spinner) {
          position: absolute;
          top: 50%;
          right: 50%;
          transform: translate(50%, -50%);
        }
        :global(.ql-block-image.error) {
          width: 100%;
          height: 100px;
          background-color: red;
          content: "Error! Error!";
          color: white;
          text-align: center;
        }
        :global(.ql-block-image.error::after) {
          content: "Error! Error!";
          color: white;
          text-align: center;
          width: 100%;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        :global(.ql-youtube-video) {
          text-align: center;
          margin: 10px 0;
          background-color: #ff0000;
        }
        :global(.ql-youtube-video iframe) {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        :global(.ql-tiktok-embed.loading) {
          background-color: aquamarine;
          padding: 30px;
          text-align: center;
          color: white;
          height: 80px;
          /*
           * Figure out how to readd overflow hidden to this
           */
        }
        :global(.ql-youtube-video .loading-message) {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        :global(.ql-tiktok-embed.loading .loading-message) {
          position: relative;
          margin-bottom: 50px;
        }
        :global(.tiktok-video) {
          white-space: normal;
        }
        :global(.tiktok-video) :global(blockquote) {
          border-left: 0 !important;
          padding: 0 !important;
        }
        :global(.ql-tumblr-embed.loading) {
          background-color: #34526f;
          text-align: center;
          color: white;
          min-height: 80px;
          /*
           * Figure out how to readd overflow hidden to this
           */
        }
        :global(.ql-tumblr-embed iframe) {
          margin: 3px auto !important;
        }
        :global(.ql-tumblr-embed .loading-message) {
          position: relative;
          margin-bottom: 50px;
        }
        :global(.embed-overlay) {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          pointer-events: none;
        }
        :global(.close-button) {
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
        :global(.close-button svg) {
          fill: #ccc;
          top: 50%;
          left: 50%;
          display: block;
          position: absolute;
          transform: translate(-50%, -50%);
        }
        :global(.close-button:hover svg, .close-button:hover) {
          fill: white;
          border-color: white;
          cursor: pointer;
        }
        :global(.editor.view-only .close-button) {
          display: none;
        }
        :global(.inline-spoilers) {
          padding: 1px;
          border: 1px dashed black;
          background-color: #e6dede;
        }
        :global(.view-only .inline-spoilers:not(.visible) code) {
          background-color: black !important;
        }
        :global(.inline-spoilers:hover) {
          cursor: pointer;
        }
        :global(.inline-spoilers.visible) {
        }
        :global(.view-only .inline-spoilers) {
          background-color: black;
        }
        :global(.view-only .inline-spoilers:not(.visible), .view-only
            .inline-spoilers:not(.visible)
            *) {
          color: transparent !important;
          text-decoration-color: transparent !important;
        }
        :global(.view-only .inline-spoilers.visible) {
          background-color: transparent;
          color: inherit;
        }
        :global(.view-only .options-overlay) {
          display: none;
        }
        :global(.options-overlay) {
          display: inline-flex;
          background-color: #444;
          max-width: 300px;
          border-radius: 15px;
          padding: 5px 15px;
          margin-top: 5px;
          pointer-events: all;
          position: relative;
          z-index: 2;
        }
        :global(.embed-options-button) {
          height: 20px;
          width: 20px;
          margin: 0px 3px;
        }
        :global(.embed-options-button.active .ql-fill) {
          fill: white;
        }
        :global(.embed-options-button:hover) {
          cursor: pointer;
        }
        :global(.embed-options-button > svg) {
          height: 20px;
          width: 20px;
        }
        :global(.view-only .embed-overlay.spoilers::after) {
          opacity: 1;
        }
        :global(.view-only .embed-overlay.spoilers) {
          pointer-events: all;
        }
        :global(.view-only .embed-overlay.spoilers:hover) {
          cursor: pointer;
        }
        :global(.embed-overlay.spoilers::after) {
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
        }
        :global(.view-only img.spoilers) {
          visibility: hidden;
        }
        :global(.view-only .show-spoilers img.spoilers) {
          visibility: visible;
        }
        :global(.show-spoilers .embed-overlay.spoilers::after) {
          visibility: hidden;
        }
        :global(.show-spoilers .embed-overlay.spoilers) {
          display: none;
        }
        :global(.show-spoilers img:hover) {
          cursor: pointer;
        }
        :global(.ql-oembed-embed) {
          white-space: normal;
        }
        :global(.ql-oembed-embed .embed-node.loading) {
          visibility: hidden;
        }
        :global(.ql-oembed-embed .loading-message, .ql-tumblr-embed
            .loading-message) {
          width: 100%;
          height: 50px;
          margin: 10px 0;
          text-align: center;
          line-height: 50px;
          color: white;
          position: relative;
        }
        :global(.ql-oembed-embed .loading-message a, .ql-tumblr-embed
            .loading-message
            a, .tweet .loading-message a) {
          position: absolute !important;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }
      `}</style>
    </>
  );
};
