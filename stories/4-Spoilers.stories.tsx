import { action } from "@storybook/addon-actions";
import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";

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

TwitterThreadEmbed.story = {
  name: "twitter thread",
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
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={false}
      initialText={JSON.parse(
        '[{"insert":"I have a secret"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"The truth is, I\'m "},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"tormented by "},{"attributes":{"inline-spoilers":true,"italic":true,"bold":true},"insert":"Solid Snake"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":"\'s "},{"attributes":{"inline-spoilers":true,"italic":true,"link":"https://www.youtube.com/watch?v=Xet47C7yyqw"},"insert":"Perfect Bubble"},{"attributes":{"inline-spoilers":true,"italic":true},"insert":" Butt"},{"attributes":{"italic":true},"insert":"."},{"insert":"\\n"}]'
      )}
    />
  </div>
);
