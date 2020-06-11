import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";

export default {
  title: "Embeds Stories",
  component: Editor,
};

export const EmbedStories = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"youtube-video":"https://www.youtube.com/embed/ROPpn-QcLZM"}},{"insert":"\\n"}]'
      )}
      onTextChange={() => {
        console.log("changed!");
      }}
      focus={true}
      onIsEmptyChange={() => {
        console.log("empty!");
      }}
      onSubmit={() => {
        // This is for cmd + enter
        console.log("submit!");
      }}
    />
  </div>
);

EmbedStories.story = {
  name: "youtube",
};
