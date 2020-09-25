import React from "react";
//import { linkTo } from "@storybook/addon-links";
import Editor, { EditorHandler, getAllImages, replaceImages } from "../src";

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
      focusOnMount={true}
      onTextChange={() => {
        console.log("changed!");
      }}
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

export const MultiParagraph = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse(
        '[{"insert":"Open RP"},{"attributes":{"header":1},"insert":"\\n"},{"insert":"You have my sword...\\nBut "},{"attributes":{"link":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"},"insert":"do you know what else you have"},{"insert": "?\\n\\nMy heart.\\n\\nLorem Ipsum, fam.\\n"}]'
      )}
      focusOnMount={true}
      onTextChange={() => {
        console.log("changed!");
      }}
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

MultiParagraph.story = {
  name: "multiparagraph",
};

export const SingleLineEditor = () => (
  <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
    <Editor
      editable={true}
      initialText={JSON.parse('[{"insert":"This is a single line editor."}]')}
      onTextChange={() => {
        console.log("changed!");
      }}
      singleLine={true}
      focusOnMount={true}
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
          onTextChange={() => {
            console.log("changed!");
          }}
          onIsEmptyChange={() => {
            console.log("empty!");
          }}
          onSubmit={() => {
            // This is for cmd + enter
            console.log("submit!");
          }}
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
          onIsEmptyChange={() => {
            console.log("empty!");
          }}
          onSubmit={() => {
            // This is for cmd + enter
            console.log("submit!");
          }}
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
          onTextChange={() => {
            console.log("changed!");
          }}
          onIsEmptyChange={() => {
            console.log("empty!");
          }}
          onSubmit={() => {
            // This is for cmd + enter
            console.log("submit!");
          }}
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

EditorSimple.story = {
  name: "simple",
};
