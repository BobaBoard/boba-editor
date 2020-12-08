import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, { setTumblrEmbedFetcher, setOEmbedFetcher } from "../src";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Error Stories",
  component: Editor,
};

// TODO: only one of these should exist since it's global.
setTumblrEmbedFetcher((url: string) => {
  logging(`""Fetching"" from ${url}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url:
          "https://turquoisemagpie.tumblr.com/post/618042321716510720/eternity-stuck-in-white-noise-can-drive-you-a",
        href:
          "https://embed.tumblr.com/embed/post/2_D8XbYRWYBtQD0A9Pfw-w/618042321716510720",
        did: "22a0a2f8b7a33dc50bbf5f49fb53f92b181a88aa",
        embedWidth: "540",
      });
    }, 5000);
  });
});

const LOAD_DELAY = 1000;
setOEmbedFetcher((url: string) => {
  logging(`""Fetching"" from ${url}`);
  const promise = new Promise((resolve) => {
    resolve({});
  });
  return promise;
});

export const TwitterEmbed = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":"https://twitter.com/BobaBoard/status/126393650908160"}},{"insert":"\\n"}]}'
      )}
      onTextChange={() => {
        logging("changed!");
      }}
      focusOnMount={true}
      onIsEmptyChange={() => {
        logging("empty!");
      }}
      onSubmit={() => {
        // This is for cmd + enter
        logging("submit!");
      }}
    />
  </div>
);

TwitterEmbed.story = {
  name: "twitter (wrong id)",
};

export const TwitterEmbedNoId = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '{"ops":[{"insert":"TODO: Fix This!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":"https://twitter.com/BobaBoard/status/12639365090sdsd8160"}},{"insert":"\\n"}]}'
      )}
      onTextChange={() => {
        logging("changed!");
      }}
      focusOnMount={true}
      onIsEmptyChange={() => {
        logging("empty!");
      }}
      onSubmit={() => {
        // This is for cmd + enter
        logging("submit!");
      }}
    />
  </div>
);

TwitterEmbedNoId.story = {
  name: "twitter (no id)",
};

export const MissingUrl = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"It\'s TikTok time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"pixiv-embed":{"id":"6718335390845095173"}}},{"insert":"\\n"}]'
      )}
      onTextChange={() => {
        logging("changed!");
      }}
      focusOnMount={true}
      onIsEmptyChange={() => {
        logging("empty!");
      }}
      onSubmit={() => {
        // This is for cmd + enter
        logging("submit!");
      }}
    />
  </div>
);

MissingUrl.story = {
  name: "missing url",
};
