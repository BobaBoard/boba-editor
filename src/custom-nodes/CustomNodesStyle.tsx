import React from "react";

export default (props: {}) => {
  return (
    <>
      <style jsx>{`
        :global(.ql-embed .error-message) {
          width: 100%;
          height: 50px;
          background-color: red;
          border-radius: 5px;
          text-align: center;
          line-height: 50px;
          color: white;
          margin: 10px 0;
        }
        :global(.ql-embed.ios-bug .error-message) {
          width: 100%;
          height: 150px;
          background-color: black;
          border-radius: 15px;
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
          height: 50px;
          background-color: #1da1f2;
          margin: 10px 0;
          text-align: center;
          border-radius: 15px;
          line-height: 50px;
          color: white;
          position: relative;
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
          margin: 10px 0;
        }
        :global(.ql-youtube-video) {
          text-align: center;
          margin: 10px 0;
          background-color: #ff0000;
          border-radius: 15px;
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
          padding: 30px;
          text-align: center;
          color: white;
          height: 80px;
          /*
           * Figure out how to readd overflow hidden to this
           */
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
      `}</style>
    </>
  );
};
