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
  title: "Embeds/TikTok",
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

const PALPATIME = {
  url: "https://www.tiktok.com/@maceahwindu/video/7041034696217693446",
  width: "500",
  height: "721",
};

const CURSED_FOOD = {
  url: "https://vm.tiktok.com/TTPdM3DoG3/",
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
const TikTok: Story<TemplateArgs> = (args: TemplateArgs) => {
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
              insert: "TikTok Embed!",
            },
            {
              attributes: {
                header: 1,
              },
              insert: "\n",
            },
            {
              insert: {
                "tiktok-embed": {
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

export const Base = TikTok.bind({});
Base.args = {
  ...PALPATIME,
  editable: false,
};

export const ShortUrl = TikTok.bind({});
ShortUrl.args = {
  ...CURSED_FOOD,
};

export const Spoilers = TikTok.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

export const InfiniteLoad = TikTok.bind({});
InfiniteLoad.args = {
  ...Base.args,
  delay: 1000000000,
};

// export const BadUrl = TikTok.bind({});
// BadUrl.args = {
//   ...Base.args,
//   ...BAD_URL_POST,
// };

export const WithCache = TikTok.bind({});
WithCache.args = {
  ...Base.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(TikTokEmbed)];

export const EditableBase = TikTok.bind({});
EditableBase.args = {
  ...PALPATIME,
  editable: true,
};

export const EditableSpoilers = TikTok.bind({});
EditableSpoilers.args = {
  ...EditableBase.args,
  spoilers: true,
  editable: true,
};

export const EditableInfiniteLoad = TikTok.bind({});
EditableInfiniteLoad.args = {
  ...EditableBase.args,
  delay: 1000000000,
};

// export const EditableBadUrl = TikTok.bind({});
// EditableBadUrl.args = {
//   ...BAD_URL_POST,
//   editable: true,
// };

export const SSR = TikTok.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
