//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../../src";
import { Meta, Story } from "@storybook/react";

import { EditorContextProps } from "Editor";
import React from "react";
import { TumblrEmbed } from "../../src/custom-nodes";
import { WITH_CACHE } from "../utils/decorators";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds/Tumblr",
  component: Editor,
} as Meta;

const REMOTE_EMBEDS_URL = `https://boba-embeds.herokuapp.com/iframely`;
const LOCAL_EMBEDS_URL = `http://localhost:8061/iframely`;

const embedsUrl =
  process.env.STORYBOOK_LOCAL_EMBEDS === "true"
    ? LOCAL_EMBEDS_URL
    : REMOTE_EMBEDS_URL;

const getFetcher = (delay: number = 1000) => ({
  fetchers: {
    getOEmbedFromUrl: (url: string) => {
      const promise = new Promise((resolve, reject) => {
        logging(`Calling ${embedsUrl}?iframe=0&uri=${url}`);
        fetch(`${embedsUrl}?iframe=0&uri=${url}`)
          .then((response) => {
            setTimeout(() => {
              resolve(response.json());
            }, delay);
          })
          .catch((error) => {
            reject(error);
          });
      });
      return promise;
    },
  },
});

const ROBINBOOB_POST = {
  url: "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
  width: "500",
  height: "1112",
};

const PRELOADED_ROBINBOOB_POST = {
  ...ROBINBOOB_POST,
  did: "211b71f5c49a42458fc23a95335d65c4331e91b4",
  href: "https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824",
};

const BAD_URL_POST = {
  url: "https://bobaboard.tumblr.com/post/2130283/this-april-1st-bobaboard-is-proud-to-bring-its",
  width: "500",
  height: "1112",
  did: "238901289",
  href: "https://embed.tumblr.com/embed/post/109238-QOcKbxGMsw/123123",
};

interface TemplateArgs {
  url: string;
  href?: string;
  did?: string;
  width?: string;
  height?: string;
  editable?: boolean;
  delay?: number;
  spoilers?: boolean;
  ssr?: boolean;
  embedsCache?: EditorContextProps["cache"];
}
const Tumblr: Story<TemplateArgs> = (args: TemplateArgs) => {
  const embedFetchers = React.useMemo(
    () => ({
      ...getFetcher(args.delay),
      cache: args.embedsCache,
    }),
    [args.delay, args.embedsCache]
  );

  return (
    <EditorContext.Provider value={embedFetchers}>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={args.editable === undefined ? true : args.editable}
          forceSSR={args.ssr}
          initialText={[
            {
              insert: "Tumblr Embed!",
            },
            {
              attributes: {
                header: 1,
              },
              insert: "\n",
            },
            {
              insert: {
                "tumblr-embed": {
                  embedHeight: args.height,
                  embedWidth: args.width,
                  url: args.url,
                  href: args.href,
                  did: args.did,
                  spoilers: args.spoilers,
                },
              },
            },
            {
              insert: "\n",
            },
          ]}
          onTextChange={() => {
            action("changed!");
          }}
          focusOnMount={true}
          onIsEmptyChange={() => {
            action("empty!");
          }}
          onEmbedLoaded={() => {
            action("loaded!");
          }}
        />
      </div>
    </EditorContext.Provider>
  );
};

export const Base = Tumblr.bind({});
Base.args = {
  ...PRELOADED_ROBINBOOB_POST,
  editable: false,
};

export const Spoilers = Tumblr.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

// export const InfiniteLoad = Tumblr.bind({});
// InfiniteLoad.args = {
//   ...Base.args,
//   // TODO: this does not work on pre-loaded tumblr cause it doesn't use the oEmbed fetcher
//   delay: 1000000000,
// };

export const BadUrl = Tumblr.bind({});
BadUrl.args = {
  ...Base.args,
  ...BAD_URL_POST,
};

export const WithCache = Tumblr.bind({});
WithCache.args = {
  ...Base.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(TumblrEmbed)];

export const EditableBase = Tumblr.bind({});
EditableBase.args = {
  ...ROBINBOOB_POST,
  editable: true,
};

export const EditableSpoilers = Tumblr.bind({});
EditableSpoilers.args = {
  ...EditableBase.args,
  spoilers: true,
  editable: true,
};

export const EditableInfiniteLoad = Tumblr.bind({});
EditableInfiniteLoad.args = {
  ...EditableBase.args,
  // TODO: this does not work on twitter cause it doesn't use the oEmbed fetcher
  delay: 1000000000,
};

export const EditableBadUrl = Tumblr.bind({});
EditableBadUrl.args = {
  ...BAD_URL_POST,
  editable: true,
};

export const SSR = Tumblr.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
