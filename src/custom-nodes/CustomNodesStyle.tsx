import React from "react";

export default (props: {}) => {
  return (
    <>
      <style jsx>{`
        :global(.tweet.error) {
          width: 100%;
          height: 50px;
          background-color: red;
          border-radius: 5px;
          text-align: center;
          line-height: 50px;
          color: white;
          margin: 10px 0;
        }
        :global(.tweet.loading) {
          width: 100%;
          height: 50px;
          background-color: gray;
          margin: 10px 0;
          text-align: center;
          line-height: 50px;
          color: white;
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
        :global(.ql-tiktok-embed.loading) :global(.loading-message) {
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
          margin-bottom: 50px;
        }
        :global(.embed-container) {
          position: relative;
        }
        :global(.close-button) {
          width: 50px;
          height: 50px;
          background-color: red;
          position: absolute;
          top: -25px;
          right: -25px;
          border-radius: 50%;
        }
        :global(.close-button:hover) {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};
