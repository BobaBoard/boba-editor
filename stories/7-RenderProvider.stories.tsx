import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, {
  EditorHandler,
  EditorContext,
  getAllImages,
  removeTrailingWhitespace,
  replaceImages,
} from "../src";
import { action } from "@storybook/addon-actions";

const logging = require("debug")("bobapost:stories:renderProvider");

export default {
  title: "Render Provider",
  component: Editor,
};

const renderProvider = {
  render: {
    listSelect: (
      items: [
        {
          id: string;
          name: string;
        }
      ]
    ) => {
      return (
        <div>
          {items.map((item) => (
            <li>{item.name}</li>
          ))}
        </div>
      );
    },
  },
};

const EditableEditorTemplate = (args: any) => {
  return (
    <EditorContext.Provider value={renderProvider}>
      <div
        style={{
          backgroundColor: "white",
          minHeight: "10px",
          maxWidth: "500px",
          marginTop: "100px",
        }}
      >
        <Editor
          editable={args.editable ?? true}
          initialText={JSON.parse(args.initialText)}
          focusOnMount={args.focusOnMount}
          singleLine={args.singleLine}
          onTextChange={action("TextChange")}
          onIsEmptyChange={args.onIsEmptyChange || action("EmptyChange")}
          forceSSR={args.forceSSR}
        />
      </div>
    </EditorContext.Provider>
  );
};

export const SimpleEditor = EditableEditorTemplate.bind({});
SimpleEditor.args = {
  initialText:
    '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":{"src":"http://www.deelay.me/1000/https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png","width":3840,"height":2160}}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]',
};
