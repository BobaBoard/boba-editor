//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../../src";
import { Meta, Story } from "@storybook/react";

import { EditorContextProps } from "Editor";
import React from "react";
import { TweetEmbed } from "../../src/custom-nodes";
import { WITH_CACHE } from "../utils/decorators";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds/Twitter",
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

const CODE_HACK_TWEET = {
  url: "https://twitter.com/BobaBoard/status/1263913643650908160",
  width: "500",
  height: "649",
};

const THREAD_TWEET = {
  url: "https://twitter.com/EssentialRandom/status/1475675728414838785?s=20",
  width: "500",
  height: "362",
};

interface TemplateArgs {
  url: string;
  width?: string;
  height?: string;
  editable?: boolean;
  delay?: number;
  spoilers?: boolean;
  thread?: boolean;
  ssr?: boolean;
  embedsCache?: EditorContextProps["cache"];
}
const TwitterTemplate: Story<TemplateArgs> = (args: TemplateArgs) => {
  const embedFetchers = React.useMemo(
    () => ({
      ...getFetcher(args.delay),
      cache: args.embedsCache,
    }),
    [args.delay]
  );
  return (
    <div>
      <EditorContext.Provider value={embedFetchers}>
        <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
          <Editor
            editable={args.editable === undefined ? true : args.editable}
            forceSSR={args.ssr}
            initialText={[
              {
                insert: "Twitter Embed!",
              },
              {
                attributes: {
                  header: 1,
                },
                insert: "\n",
              },
              {
                insert: {
                  tweet: {
                    embedHeight: args.height,
                    embedWidth: args.width,
                    url: args.url,
                    spoilers: args.spoilers,
                    thread: args.thread,
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
      <div
        style={{
          position: "fixed",
          right: "0",
          top: "0",
          backgroundColor: "aliceblue",
        }}
      >
        <div className="values"></div>
        <button
          onClick={() => {
            document.querySelector(".values")!.innerHTML = JSON.stringify(
              TweetEmbed.value(document.querySelector(".ql-tweet")!),
              null,
              2
            );
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export const Base = TwitterTemplate.bind({});
Base.args = {
  ...CODE_HACK_TWEET,
  editable: false,
};

export const Spoilers = TwitterTemplate.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

export const WithCache = TwitterTemplate.bind({});
WithCache.args = {
  ...Spoilers.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(TweetEmbed)];

// export const InfiniteLoad = TwitterTemplate.bind({});
// InfiniteLoad.args = {
//   ...Base.args,
//   // TODO: this does not work on twitter cause it doesn't use the oEmbed fetcher
//   delay: 1000000000,
// };

export const BadUrl = TwitterTemplate.bind({});
BadUrl.args = {
  ...Base.args,
  url: "https://twitter.com/BobaBoard/status/1263913643650908161",
};

export const Thread = TwitterTemplate.bind({});
Thread.args = {
  ...Base.args,
  ...THREAD_TWEET,
  thread: true,
};

export const EditableBase = TwitterTemplate.bind({});
EditableBase.args = {
  ...Base.args,
  editable: true,
};

export const EditableSpoilers = TwitterTemplate.bind({});
EditableSpoilers.args = {
  ...Spoilers.args,
  editable: true,
};

// export const EditableInfiniteLoad = TwitterTemplate.bind({});
// EditableInfiniteLoad.args = {
//   ...EditableBase.args,
//   // TODO: this does not work on twitter cause it doesn't use the oEmbed fetcher
//   delay: 1000000000,
// };

export const EditableBadUrl = TwitterTemplate.bind({});
EditableBadUrl.args = {
  ...BadUrl.args,
  editable: true,
};

export const EditableThread = TwitterTemplate.bind({});
EditableThread.args = {
  ...Thread.args,
  editable: true,
};

export const SSR = TwitterTemplate.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
