import { action } from "@storybook/addon-actions";
import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor from "../src";

export default {
  title: "Performance Preview",
  component: Editor,
};

const EditableEditorTemplate = (args: any) => {
  const singleEditor = (i: number) => (
    <div
      style={{
        backgroundColor: "white",
        maxWidth: "500px",
        marginTop: "20px",
      }}
      key={i}
    >
      <Editor editable={false} initialText={JSON.parse(args.initialText)} />
    </div>
  );

  const editors = [];
  for (let i = 0; i < 300; i++) {
    editors.push(singleEditor(i));
  }
  return <>{editors}</>;
};

export const Performance = EditableEditorTemplate.bind({});
Performance.args = {
  initialText:
    '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]',
};

Performance.story = {
  name: "Performance",
};
