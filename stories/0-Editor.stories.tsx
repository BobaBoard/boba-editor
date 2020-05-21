import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";

export default {
  title: "Editor Preview",
  component: Editor,
};

export const EditorSimple = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]'
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

EditorSimple.story = {
  name: "simple",
};

export const EditorState = () => {
  const [enabled, setEnabled] = React.useState(false);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable={enabled}
          initialText={JSON.parse(
            '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]'
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
      <a
        href="#"
        onClick={() => {
          setEnabled(!enabled);
        }}
      >
        Change state
      </a>
    </div>
  );
};

EditorState.story = {
  name: "state toggle",
};
