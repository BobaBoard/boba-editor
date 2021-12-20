import React, { CSSProperties } from "react";

//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";
import { action } from "@storybook/addon-actions";

export default {
  title: "Spoilers",
  component: Editor,
};

export const EditorSimple = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"italic":true,"inline-spoilers":true},"insert":"tormented by Solid Snake\'s Perfect Bubble Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
      onTextChange={(text) => {
        console.log(JSON.stringify(text));
        action("text")(text);
      }}
      focusOnMount={true}
      onIsEmptyChange={action("empty")}
      onSubmit={action("submit")}
    />
  </div>
);

EditorSimple.story = {
  name: "editing",
};

export const SpoilersNotEditable = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={false}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"italic":true,"inline-spoilers":true},"insert":"tormented by Solid Snake\'s Perfect Bubble Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
    />
  </div>
);

SpoilersNotEditable.story = {
  name: "not-editable",
};

export const SpoilersImage = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://media.tenor.com/images/caee629b8e640f7217b2b4b9bda49bac/tenor.gif"}},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"tormented by Solid Snake\'s Perfect Bubble Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
      onTextChange={() => {}}
      focusOnMount={true}
      onIsEmptyChange={() => {}}
      onSubmit={() => {
        // This is for cmd + enter
        console.log("submit!");
      }}
    />
  </div>
);

SpoilersImage.story = {
  name: "image",
};

export const SpoilersImageNonEditable = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={false}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":{"src":"https://media.tenor.com/images/caee629b8e640f7217b2b4b9bda49bac/tenor.gif","spoilers":true,"width":498,"height":392}}},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"tormented by Solid Snake\'s Perfect Bubble Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
    />
  </div>
);

SpoilersImageNonEditable.story = {
  name: "image (not editable)",
};

export const TwitterThreadEmbed = () => {
  const [loading, setLoading] = React.useState(true);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={false}
          initialText={JSON.parse(
            '{"ops":[{"insert":"Twitter Embed!"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"tweet":{"thread": true, "spoilers": true, "embedHeight": "689", "embedWidth": "500", "url": "https://twitter.com/hasenschneck/status/1311215026506784768"}}},{"insert":"\\n"}]}'
          )}
          onEmbedLoaded={() => {
            setLoading(false);
          }}
        />
      </div>
      Embed Status: {loading ? "loading" : "loaded"}.
    </div>
  );
};

export const TumblrThreadEmbed = () => {
  const [loading, setLoading] = React.useState(true);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={false}
          initialText={JSON.parse(
            '[{"insert":"NOTE: Tumblr Posts"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"Tumblr posts are a bit weird. Unless you provide an endpoint that allows fetching the oEmbed data given the Tumblr URL, they won\'t work. It sucks, and I accept solutions.\\n"},{"insert":{"tumblr-embed":{"embedHeight": "840", "embedWidth": "500", "href":"https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824","did":"211b71f5c49a42458fc23a95335d65c4331e91b4","url":"https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its","spoilers":true}}},{"insert":"\\n"}]'
          )}
          onEmbedLoaded={() => {
            setLoading(false);
          }}
        />
      </div>
      Embed Status: {loading ? "loading" : "loaded"}.
    </div>
  );
};

TumblrThreadEmbed.story = {
  name: "tumblr thread",
};

export const LinkAndMultipleFormattingEditable = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"tormented by "},{"attributes":{"inline-spoilers":true,"italic":true,"bold":true},"insert":"Solid Snake"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"\'s "},{"attributes":{"inline-spoilers":true,"italic":true,"link":"https://www.youtube.com/watch?v=Xet47C7yyqw"},"insert":"Perfect Bubble"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":" Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
      onTextChange={(text) => {
        console.log(JSON.stringify(text));
        action("text")(text);
      }}
      focusOnMount={true}
      onIsEmptyChange={action("empty")}
      onSubmit={action("submit")}
    />
  </div>
);

export const LinkAndMultipleFormattingNotEditable = () => (
  <div>
    <div
      className="test"
      style={
        {
          backgroundColor: "white",
          maxWidth: "500px",
          "--a-visited-color": "green",
          "--a-color": "brown",
        } as CSSProperties
      }
    >
      <Editor
        editable={false}
        initialText={JSON.parse(
          '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"tormented by "},{"attributes":{"inline-spoilers":true,"italic":true,"bold":true},"insert":"Solid Snake"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"\'s "},{"attributes":{"inline-spoilers":true,"italic":true,"link":"https://www.youtube.com/watch?v=Xet47C7yyqw"},"insert":"Perfect Bubble"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":" Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
        )}
      />
    </div>
  </div>
);
