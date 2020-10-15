import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, {
  EditorHandler,
  getAllImages,
  removeTrailingWhitespace,
  replaceImages,
} from "../src";
import { action } from "@storybook/addon-actions";

export default {
  title: "Editor Preview",
  component: Editor,
};

const EditableEditorTemplate = (args: any) => {
  return (
    <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
      <Editor
        editable={true}
        initialText={JSON.parse(args.initialText)}
        focusOnMount={args.focusOnMount}
        singleLine={args.singleLine}
        onTextChange={action("TextChange")}
        onIsEmptyChange={action("EmptyChange")}
        onSubmit={action("Submit")}
      />
    </div>
  );
};

export const SimpleEditor = EditableEditorTemplate.bind({});
SimpleEditor.args = {
  initialText:
    '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]',
  focusOnMount: true,
};

SimpleEditor.story = {
  name: "simple",
};

export const MultiParagraph = EditableEditorTemplate.bind({});
MultiParagraph.args = {
  initialText:
    '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"You have my sword...\\nBut "},{"attributes":{"link":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},"insert":"do you know what else you have"},{"insert": "?\\n\\nMy heart.\\n\\nLorem Ipsum, fam.\\n"}]',
};

MultiParagraph.story = {
  name: "multiparagraph",
};

export const SingleLineEditor = EditableEditorTemplate.bind({});
SingleLineEditor.args = {
  initialText: '[{"insert":"This is a single line editor."}]',
  singleLine: true,
};

SingleLineEditor.story = {
  name: "single line",
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
          onTextChange={action("TextChange")}
          onIsEmptyChange={action("EmptyChange")}
          onSubmit={action("Submit")}
        />
      </div>
      <input
        type="button"
        onClick={(e) => {
          setEnabled(!enabled);
        }}
        value={`toggle enabled (${enabled ? "enabled" : "disabled"})`}
      />
    </div>
  );
};

EditorState.story = {
  name: "state toggle",
};

export const ImageLoading = () => {
  const [text, setText] = React.useState(
    JSON.parse(
      '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]'
    )
  );
  const [loading, setLoading] = React.useState(false);
  const [quillEditor, setEditor] = React.useState<any>(null);
  return (
    <div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          editable
          initialText={text}
          onTextChange={(text) => {
            setText(text);
          }}
          focusOnMount={true}
          onIsEmptyChange={action("EmptyChange")}
          onSubmit={action("Submit")}
          onEditorCreated={(editor) => setEditor(editor)}
        />
      </div>
      <input
        type="button"
        onClick={(e) => {
          setLoading(true);
          const images = getAllImages(text);
          setTimeout(() => {
            const replacements = images.reduce((obj, image) => {
              return {
                ...obj,
                [image]:
                  "https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small",
              };
            }, {});
            replaceImages(text, replacements);
            console.log(text);
            setText(text);
            quillEditor.setContents(text);
            setLoading(false);
          }, 3000);
        }}
        value={`upload images`}
        disabled={loading}
      />
    </div>
  );
};

ImageLoading.story = {
  name: "image upload",
};

export const EditorFocus = () => {
  const editorRef = React.createRef<EditorHandler>();
  return (
    <>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor
          handler={editorRef}
          editable={true}
          initialText={JSON.parse(
            '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":{"block-image":"https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png"}}, {"attributes":{"italic":true},"insert":"You have my sword..."}]'
          )}
          onTextChange={action("TextChange")}
          onIsEmptyChange={action("EmptyChange")}
          onSubmit={action("Submit")}
        />
      </div>
      <input
        type="button"
        onClick={(e) => {
          editorRef.current?.focus();
        }}
        value="focus"
      />
    </>
  );
};

export const OutputTest = () => {
  const [text, setText] = React.useState(
    JSON.parse(
      '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"attributes":{"italic":true},"insert":"You have my sword..."},{"attributes":{"list":"bullet"},"insert":"\\n"},{"attributes":{"italic":true},"insert":"sdasdas"},{"attributes":{"list":"bullet"},"insert":"\\n"},{"attributes":{"italic":true},"insert":"asdasd"},{"attributes":{"list":"bullet"},"insert":"\\n"},{"attributes":{"italic":true},"insert":"adsdasdas"},{"attributes":{"list":"bullet"},"insert":"\\n"}]'
    )
  );
  const [quillEditor, setEditor] = React.useState<any>(null);
  return (
    <div>
      <div
        style={{ backgroundColor: "white", maxWidth: "500px" }}
        key="editor1div"
      >
        <Editor
          key="editor1"
          editable
          initialText={text}
          onTextChange={(text) => {
            setText(text);
          }}
          focusOnMount={true}
          onIsEmptyChange={action("EmptyChange")}
          onSubmit={action("Submit")}
        />
      </div>
      <input
        type="button"
        onClick={(e) => {
          // @ts-ignore
          console.log(JSON.stringify(text.ops).replaceAll("\\n", "\\\\n"));
          quillEditor?.setContents(removeTrailingWhitespace(text));
        }}
        value={`Submit`}
      />

      <div
        style={{ backgroundColor: "white", maxWidth: "500px" }}
        key="editor2div"
      >
        <Editor
          key="editor2"
          initialText={text}
          onEditorCreated={(editor) => setEditor(editor)}
        />
      </div>
    </div>
  );
};

OutputTest.story = {
  name: "outputTest",
};
