//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../../src";
import { Meta, Story } from "@storybook/react";

import { EditorContextProps } from "Editor";
import React from "react";
import { TikTokEmbed } from "../../src/custom-nodes";
import { WITH_CACHE } from "../utils/decorators";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds/Reddit",
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

const BEGINNING_END = {
  url: "https://www.reddit.com/r/ProgrammerHumor/comments/avj910/developers/",
  width: "500",
  height: "721",
};

interface TemplateArgs {
  url: string;
  width?: string;
  height?: string;
  editable?: boolean;
  delay?: number;
  spoilers?: boolean;
  ssr?: boolean;
  embedsCache?: EditorContextProps["cache"];
}
const Reddit: Story<TemplateArgs> = (args: TemplateArgs) => {
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
              insert: "Reddit Embed!",
            },
            {
              attributes: {
                header: 1,
              },
              insert: "\n",
            },
            {
              insert: {
                "reddit-embed": {
                  embedHeight: args.height,
                  embedWidth: args.width,
                  url: args.url,
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

export const Base = Reddit.bind({});
Base.args = {
  ...BEGINNING_END,
  editable: false,
};

export const Spoilers = Reddit.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

export const InfiniteLoad = Reddit.bind({});
InfiniteLoad.args = {
  ...Base.args,
  delay: 1000000000,
};

// export const BadUrl = TikTok.bind({});
// BadUrl.args = {
//   ...Base.args,
//   ...BAD_URL_POST,
// };

export const WithCache = Reddit.bind({});
WithCache.args = {
  ...Base.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(TikTokEmbed)];

export const EditableBase = Reddit.bind({});
EditableBase.args = {
  ...BEGINNING_END,
  editable: true,
};

export const EditableSpoilers = Reddit.bind({});
EditableSpoilers.args = {
  ...EditableBase.args,
  spoilers: true,
  editable: true,
};

export const EditableInfiniteLoad = Reddit.bind({});
EditableInfiniteLoad.args = {
  ...EditableBase.args,
  delay: 1000000000,
};

// export const EditableBadUrl = TikTok.bind({});
// EditableBadUrl.args = {
//   ...BAD_URL_POST,
//   editable: true,
// };

export const SSR = Reddit.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
