import { action } from "@storybook/addon-actions";
import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorContext } from "../src";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds Stories",
  component: Editor,
};

const REMOTE_EMBEDS_URL = `https://boba-embeds.herokuapp.com/iframely`;
const LOCAL_EMBEDS_URL = `http://localhost:8061/iframely`;

const embedsUrl =
  process.env.STORYBOOK_LOCAL_EMBEDS === "true"
    ? LOCAL_EMBEDS_URL
    : REMOTE_EMBEDS_URL;

const embedFetchers = {
  fetchers: {
    getOEmbedFromUrl: (url: string) => {
      const LOAD_DELAY = 1000;
      const promise = new Promise((resolve, reject) => {
        logging(`Calling ${embedsUrl}?iframe=0&uri=${url}`);
        fetch(`${embedsUrl}?iframe=0&uri=${url}`)
          .then((response) => {
            setTimeout(() => {
              resolve(response.json());
            }, LOAD_DELAY);
          })
          .catch((error) => {
            reject(error);
          });
      });
      return promise;
    },
  },
};

const embedCache = {
  cache: new Map(),
};

const IMAGE =
  '[{"insert":"Image Embed"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"}}]';
const TWITTER =
  '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":{"embedHeight": "596", "embedWidth": "500", "url": "https://twitter.com/BobaBoard/status/1263913643650908160"}}},{"insert":"\\n"}]}';
const TWITTER_THREAD =
  '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":{"thread": true, "embedHeight": "197", "embedWidth": "500", "url": "https://twitter.com/hasenschneck/status/1311215026506784768"}}},{"insert":"\\n"}]}';
const TUMBLR =
  '[{"insert":"NOTE: Tumblr Posts"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"Tumblr posts are a bit weird. Unless you provide an endpoint that allows fetching the oEmbed data given the Tumblr URL, they won\'t work. It sucks, and I accept solutions.\\n"},{"insert":{"tumblr-embed":{"embedHeight": "840", "embedWidth": "500", "href":"https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824","did":"211b71f5c49a42458fc23a95335d65c4331e91b4","url":"https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its"}}},{"insert":"\\n"}]';
const YOUTUBE =
  '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"Youtube has a problem where paragraphs preceding the embed are marked as empty on Safari. I refuse to keep fighting safari, so I hacked a solution.\\n"},{"insert":{"youtube-video":"https://www.youtube.com/embed/ROPpn-QcLZM"}},{"insert":"\\n"}]';
const REDDIT =
  '[{"insert":"It\'s Reddit time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"reddit-embed":{"embedHeight": "629", "embedWidth": "500","url":"https://www.reddit.com/r/nextfuckinglevel/comments/ibikdr/50_year_old_firefighter_deadlifts_600_lbs_of/"}}},{"insert":"\\n"}]';
const TIKTOK =
  '[{"insert":"It\'s TikTok time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tiktok-embed":{"id":"6718335390845095173","url":"https://www.tiktok.com/@scout2015/video/6718335390845095173"}}},{"insert":"\\n"}]';
const PIXIV =
  '[{"insert":"It\'s Pixiv time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"pixiv-embed":{"embedHeight": "540.875", "embedWidth": "500","url":"https://www.pixiv.net/en/artworks/83682624"}}},{"insert":"\\n"}]';
const INSTAGRAM =
  '[{"insert":"It\'s Instagram time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"instagram-embed":{ "embedWidth": "500", "embedHeight": "898","url":"https://instagram.com/p/89CUyVoVY9/"}}},{"insert":"\\n"}]';
const EmbedsTemplate = (args: { content: string; editable?: boolean }) => {
  const [loading, setLoading] = React.useState(true);
  return (
    <EditorContext.Provider value={embedFetchers}>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={args.editable === undefined ? true : args.editable}
          initialText={JSON.parse(args.content)}
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
          onEmbedLoaded={() => {
            setLoading(false);
          }}
        />
      </div>
      Embed Status: {loading ? "loading" : "loaded"}.
    </EditorContext.Provider>
  );
};

export const ImageEmbed = EmbedsTemplate.bind({});
ImageEmbed.args = {
  content: IMAGE,
  editable: true,
};

export const TwitterEmbed = EmbedsTemplate.bind({});
TwitterEmbed.args = {
  content: TWITTER,
  editable: true,
};

export const TwitterThreadEmbed = EmbedsTemplate.bind({});
TwitterThreadEmbed.args = {
  content: TWITTER_THREAD,
  editable: true,
};

export const YouTubeEmbed = EmbedsTemplate.bind({});
YouTubeEmbed.args = {
  content: YOUTUBE,
  editable: true,
};

export const TumblrEmbed = EmbedsTemplate.bind({});
TumblrEmbed.args = {
  content: TUMBLR,
  editable: true,
};

export const TikTokEmbed = EmbedsTemplate.bind({});
TikTokEmbed.args = {
  content: TIKTOK,
  editable: true,
};

export const InstagramEmbed = EmbedsTemplate.bind({});
InstagramEmbed.args = {
  content: INSTAGRAM,
  editable: true,
};

export const RedditEmbed = EmbedsTemplate.bind({});
RedditEmbed.args = {
  content: REDDIT,
  editable: true,
};

export const PixivEmbed = EmbedsTemplate.bind({});
PixivEmbed.args = {
  content: PIXIV,
  editable: true,
};

const TEST_EMBEDS = [
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://www.delish.com/cooking/a20086127/how-to-cook-spaghetti-squash/"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://thetwilightsad.bandcamp.com/album/oran-mor-2020"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://www.nytimes.com/2021/01/01/style/self-care/kambo-tree-frog-detox.html?action=click&module=Top%20Stories&pgtype=Homepage"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://www.ndtv.com/offbeat/happy-new-year-2021-wishes-greetings-messages-images-pics-to-share-2346091"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://knowyourmeme.com/memes/moons-haunted"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://archiveofourown.org/works/28349940/chapters/69459594"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://anarchism.space/@ExperimentV/105713537503551493"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://tanoshimi.xyz/2016/11/29/yes-sadpanda-is-one-of-my-sources/"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://egypt.urnash.com/blog/2014/08/09/stereotypes/"}',
  '{"embedHeight":"367.5","embedWidth":"500","url":"https://www.traeume-aus-edelstahl.de/details.html?_filterartnr=hr007&_random=1120875411"}',
];

export const BestEffortStory = () => (
  <EditorContext.Provider value={embedFetchers}>
    <div style={{ display: "flex", maxWidth: "100%", flexDirection: "column" }}>
      {TEST_EMBEDS.map((embed) => {
        return (
          <div
            style={{
              margin: "5px",
              flexShrink: 0,
              maxWidth: "500px",
              backgroundColor: "white",
            }}
          >
            <Editor
              editable={true}
              initialText={JSON.parse(
                `[{"insert":"It\'s Try Hard time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"oembed-embed":${embed}}},{"insert":"\\n"}]`
              )}
              onTextChange={action("changed!")}
              focusOnMount={true}
              onIsEmptyChange={() => {
                logging("empty!");
              }}
              onSubmit={action("submit")}
            />
          </div>
        );
      })}
    </div>
  </EditorContext.Provider>
);

BestEffortStory.story = {
  name: "best effort",
};

export const EmbedCaching = () => {
  const [showEmbed, setShowEmbed] = React.useState(true);
  const [editable, setEditable] = React.useState(true);
  const [embedString, setEmbedString] = React.useState(TWITTER);
  return (
    <EditorContext.Provider value={{ ...embedFetchers, ...embedCache }}>
      <div>
        <button onClick={() => setShowEmbed(!showEmbed)}>ToggleEmbed</button>
        <div>
          <button onClick={() => embedCache.cache.clear()}>ClearCache</button>
          <button onClick={() => setEditable(!editable)}>
            Change Edit State
          </button>
        </div>
        <div>
          <button onClick={() => setEmbedString(TWITTER)}>TWITTER</button>
          <button onClick={() => setEmbedString(TUMBLR)}>TUMBLR</button>
          <button onClick={() => setEmbedString(YOUTUBE)}>YOUTUBE</button>
          <button onClick={() => setEmbedString(REDDIT)}>REDDIT</button>
          <button onClick={() => setEmbedString(TIKTOK)}>TIKTOK</button>
          <button onClick={() => setEmbedString(PIXIV)}>PIXIV</button>
          <button
            onClick={() =>
              setEmbedString(
                `[{"insert":"It\'s Try Hard time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"oembed-embed":${TEST_EMBEDS[2]}}},{"insert":"\\n"}]`
              )
            }
          >
            BEST EFFORT
          </button>
        </div>
        {showEmbed && (
          <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
            <Editor
              key={embedString}
              editable={editable}
              initialText={JSON.parse(embedString)}
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
        )}
      </div>
      <div>{Array.from(embedCache.cache.keys()).join(",")}</div>
    </EditorContext.Provider>
  );
};
