import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";

export default {
  title: "Inline Modules Preview",
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
      focus={true}
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
      focus={true}
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
