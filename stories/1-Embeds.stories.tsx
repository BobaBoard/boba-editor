import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, { setTumblrEmbedFetcher, setOEmbedFetcher } from "../src";

const logging = require("debug")("bobapost:stories:embeds");

export default {
  title: "Embeds Stories",
  component: Editor,
};

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
      });
    }, 25000);
  });
});

const LOAD_DELAY = 1000;
setOEmbedFetcher((url: string) => {
  logging(`""Fetching"" from ${url}`);
  const promise = new Promise((resolve) => {
    fetch(`http://localhost:8061/iframely?uri=${url}`).then((response) => {
      setTimeout(() => {
        resolve(response.json());
      }, LOAD_DELAY);
    });
  });
  return promise;
});

export const ImageEmbed = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"Image Embed"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"}}]'
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

ImageEmbed.story = {
  name: "image",
};

export const TwitterEmbed = () => {
  const [loading, setLoading] = React.useState(true);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={true}
          initialText={JSON.parse(
            '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":{"embedHeight": "596", "embedWidth": "500", "url": "https://twitter.com/BobaBoard/status/1263913643650908160"}}},{"insert":"\\n"}]}'
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
          onEmbedLoaded={() => {
            setLoading(false);
          }}
        />
      </div>
      Embed Status: {loading ? "loading" : "loaded"}.
    </div>
  );
};

TwitterEmbed.story = {
  name: "twitter",
};

export const TwitterThreadEmbed = () => {
  const [loading, setLoading] = React.useState(true);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={true}
          initialText={JSON.parse(
            '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":{"thread": true, "embedHeight": "197", "embedWidth": "500", "url": "https://twitter.com/hasenschneck/status/1311215026506784768"}}},{"insert":"\\n"}]}'
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
          onEmbedLoaded={() => {
            setLoading(false);
          }}
        />
      </div>
      Embed Status: {loading ? "loading" : "loaded"}.
    </div>
  );
};

TwitterThreadEmbed.story = {
  name: "twitter thread",
};

export const EmbedStories = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"youtube-video":"https://www.youtube.com/embed/ROPpn-QcLZM"}},{"insert":"\\n"}]'
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

EmbedStories.story = {
  name: "youtube",
};

export const TumblrStory = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"NOTE: Tumblr Posts"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"Tumblr posts are a bit weird. Unless you provide an endpoint that allows fetching the oEmbed data given the Tumblr URL, they won\'t work. It sucks, and I accept solutions.\\n"},{"insert":{"tumblr-embed":{"embedHeight": "840", "embedWidth": "500", "href":"https://embed.tumblr.com/embed/post/2_D8XbYRWYBtQD0A9Pfw-w/618042321716510720","did":"22a0a2f8b7a33dc50bbf5f49fb53f92b181a88aa","url":"https://turquoisemagpie.tumblr.com/post/618042321716510720/eternity-stuck-in-white-noise-can-drive-you-a"}}},{"insert":"\\n"}]'
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

TumblrStory.story = {
  name: "tumblr",
};

export const TikTokStory = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"It\'s TikTok time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tiktok-embed":{"id":"6718335390845095173","url":"https://www.tiktok.com/@scout2015/video/6718335390845095173"}}},{"insert":"\\n"}]'
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

TikTokStory.story = {
  name: "tiktok",
};

export const InstagramStory = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"It\'s Instagram time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"instagram-embed":{ "embedWidth": "500", "embedHeight": "898","url":"https://instagram.com/p/89CUyVoVY9/"}}},{"insert":"\\n"}]'
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

InstagramStory.story = {
  name: "instagram",
};

export const RedditStory = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"It\'s Reddit time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"reddit-embed":{"embedHeight": "629", "embedWidth": "500","url":"https://www.reddit.com/r/nextfuckinglevel/comments/ibikdr/50_year_old_firefighter_deadlifts_600_lbs_of/"}}},{"insert":"\\n"}]'
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

RedditStory.story = {
  name: "reddit",
};

export const PixivStory = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"It\'s Pixiv time!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"pixiv-embed":{"embedHeight": "540.875", "embedWidth": "500","url":"https://www.pixiv.net/en/artworks/83682624"}}},{"insert":"\\n"}]'
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

PixivStory.story = {
  name: "pixiv",
};
