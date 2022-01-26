//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../../src";
import { Meta, Story } from "@storybook/react";

import { EditorContextProps } from "Editor";
import { OEmbedBase } from "../../src/custom-nodes";
import React from "react";
import { WITH_CACHE } from "../utils/decorators";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds/Best Effort",
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

const BLOG_ENTRY = {
  url: "https://egypt.urnash.com/blog/2014/08/09/stereotypes/",
  width: "498",
  height: "1068",
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
const BestEffort: Story<TemplateArgs> = (args: TemplateArgs) => {
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
              insert: "BestEffort Embed!",
            },
            {
              attributes: {
                header: 1,
              },
              insert: "\n",
            },
            {
              insert: {
                "oembed-embed": {
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

export const Base = BestEffort.bind({});
Base.args = {
  ...BLOG_ENTRY,
  editable: false,
};

export const Spoilers = BestEffort.bind({});
Spoilers.args = {
  ...Base.args,
  spoilers: true,
};

export const InfiniteLoad = BestEffort.bind({});
InfiniteLoad.args = {
  ...Base.args,
  delay: 1000000000,
};

// export const BadUrl = BestEffort.bind({});
// BadUrl.args = {
//   ...Base.args,
//   ...BAD_URL_POST,
// };

export const WithCache = BestEffort.bind({});
WithCache.args = {
  ...Base.args,
  spoilers: true,
};
WithCache.decorators = [WITH_CACHE(OEmbedBase)];

export const EditableBase = BestEffort.bind({});
EditableBase.args = {
  ...BLOG_ENTRY,
  editable: true,
};

export const EditableSpoilers = BestEffort.bind({});
EditableSpoilers.args = {
  ...EditableBase.args,
  spoilers: true,
  editable: true,
};

export const EditableInfiniteLoad = BestEffort.bind({});
EditableInfiniteLoad.args = {
  ...EditableBase.args,
  delay: 1000000000,
};

// export const EditableBadUrl = BestEffort.bind({});
// EditableBadUrl.args = {
//   ...BAD_URL_POST,
//   editable: true,
// };

export const SSR = BestEffort.bind({});
SSR.args = {
  ...Base.args,
  ssr: true,
};
