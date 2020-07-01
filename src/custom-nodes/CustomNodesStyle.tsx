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
        :global(.tweet .loading-message) {
          width: 100%;
          height: 50px;
          background-color: gray;
          margin: 10px 0;
          text-align: center;
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
          background-color: gray;
        }
        :global(.ql-tiktok-embed.loading) {
          background-color: aquamarine;
          padding: 30px;
          text-align: center;
          color: white;
          height: 80px;
          overflow: hidden;
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
          overflow: hidden;
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
