//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../../src";
import { Meta, Story } from "@storybook/react";

import { EditorContextProps } from "Editor";
import { PixivEmbed } from "../../src/custom-nodes";
import React from "react";
import { WITH_CACHE } from "../utils/decorators";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds/Pixiv",
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

const HUSBAND_FROM_MY_GAMES = {
  url: "https://www.pixiv.net/en/artworks/92394928",
  width: "484",
  height: "255",
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
const Pixiv: Story<TemplateArgs> = (args: TemplateArgs) => {
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
              insert: "Pixiv Embed!",
            },
            {
              attributes: {
                header: 1,
              },
              insert: "\n",
            },
            {
              insert: {
                "pixiv-embed": {
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

export const Base = Pixiv.bind({});
Base.args = {
  ...HUSBAND_FROM_MY_GAMES,
  editable: false,
};

export const Spoilers = Pixiv.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

export const InfiniteLoad = Pixiv.bind({});
InfiniteLoad.args = {
  ...Base.args,
  delay: 1000000000,
};

// export const BadUrl = Pixiv.bind({});
// BadUrl.args = {
//   ...Base.args,
//   ...BAD_URL_POST,
// };

export const WithCache = Pixiv.bind({});
WithCache.args = {
  ...Base.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(PixivEmbed)];

export const EditableBase = Pixiv.bind({});
EditableBase.args = {
  ...HUSBAND_FROM_MY_GAMES,
  editable: true,
};

export const EditableSpoilers = Pixiv.bind({});
EditableSpoilers.args = {
  ...EditableBase.args,
  spoilers: true,
  editable: true,
};

export const EditableInfiniteLoad = Pixiv.bind({});
EditableInfiniteLoad.args = {
  ...EditableBase.args,
  delay: 1000000000,
};

// export const EditableBadUrl = Pixiv.bind({});
// EditableBadUrl.args = {
//   ...BAD_URL_POST,
//   editable: true,
// };

export const SSR = Pixiv.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
