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

SpoilersImageNonEditable.story = {
  name: "image (not editable)",
};
