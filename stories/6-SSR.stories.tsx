import React from "react";
import Editor from "../src";

export default {
  title: "SSR Preview",
  component: Editor,
};

const longText = `[
    {"insert":"This is a H1 Header"},{"attributes":{"header":1},"insert":"\\n"},
    {"insert":"This is a H2 Header"},{"attributes":{"header":2},"insert":"\\n"},
    {"insert":"This is a H3 Header"},{"attributes":{"header":3},"insert":"\\n"},
    {"insert":"Some lists now: \\n"},
    {"insert":"You have my sword..."},{"attributes":{"list":"bullet"},"insert":"\\n"},
    {"insert":"this is a long paragraph which is used to test the right m (argin) on this type of list."},{"attributes":{"list":"bullet"},"insert":"\\n"},
    {"insert":"More lists now: \\n"},
    {"insert":"asdasd"},{"attributes":{"list":"ordered"},"insert":"\\n"},
    {"insert":"adsdasdas"},{"attributes":{"list":"ordered"},"insert":"\\n"},
    {"insert":"Blockquote: \\n"},
    {"attributes":{"italic":true},"insert":"This is a blockquote"},{"attributes":{"blockquote":true},"insert":"\\n"},
    {"attributes":{"italic":true},"insert":"A beautiful blockquote"},{"attributes":{"blockquote":true},"insert":"\\n"},
    {"insert":"Hello look at this blockquote"},{"attributes":{"blockquote":true},"insert":"\\n"},
    {"insert":"Codeblock: \\n"},
    {"insert":"This is code block"},{"attributes":{"code-block":true},"insert":"\\n"},
    {"insert":"And this has some "},{"attributes":{"code":true},"insert":"inline code"},{"insert":"\\n"},
    {"insert":"Also this one above is a single line break, while the one below is two:\\n\\nAnd here we are!\\n"},
    {"insert":"Image? No "},
    {"attributes":{"link":"www.goojdkajdslaksdjaklsdjaklsdjaskldjaskldjaslkdjaskldjaskl…kdjalskdjaksldjaslkdjalksdjalksdjaslkdjalskdjaslkdjlkgle.com"},"insert":"problem"},
    {"insert":"! Just pay attention to the extra empty line at the end!"},
    {"insert":{"block-image":{"src":"https://media.tenor.com/images/74905779610f0b24e5a4443f564398e6/tenor.gif","spoilers":true,"width":100,"height":100}}},
    {"attributes":{"italic":true},"insert":"This is a blockquote"},{"attributes":{"blockquote":true},"insert":"\\n"}
  ]`;

export const SSRTest = () => {
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          backgroundColor: "white",
          maxWidth: "500px",
          marginBottom: "15px",
          marginRight: "15px",
        }}
      >
        <Editor initialText={JSON.parse(longText)} forceSSR={true} />
      </div>
      <div style={{ backgroundColor: "white", maxWidth: "500px" }}>
        <Editor initialText={JSON.parse(longText)} />
      </div>
    </div>
  );
};

const IMAGE_BUG =
  '[{"insert":"Not Really a Release but,"},{"attributes":{"header":2},"insert":"\\n"},{"insert":{"block-image":{"src":"https://firebasestorage.googleapis.com/v0/b/bobaboard-fb.appspot.com/o/images%2Fbobaland%2F92a96953-9d97-4ad2-a4f1-1ec122dc34c3%2F36f0e495-ea7b-4a16-9afd-917a666b0c29.png?alt=media&token=bc150efa-8ee5-4b4a-9ace-4b482a353bba","spoilers":false,"width":1306,"height":1104}}},{"insert":"This April 1st, BobaBoard is proud to bring its target audience what they really want: "},{"attributes":{"bold":true},"insert":"more BL"},{"insert":". "},{"attributes":{"blockquote":true},"insert":"\\n"},{"insert":"I mean, of course, "},{"attributes":{"bold":true},"insert":"more BLockchain"},{"insert":". "},{"attributes":{"header":2},"insert":"\\n"},{"insert":" Buy 100% environmentally-friendly ship-ownership certificates, exclusively on sale at "},{"attributes":{"link":"https://robinboob.herokuapp.com"},"insert":"https://robinboob.herokuapp.com"},{"insert":", and follow along with the market "},{"attributes":{"link":"https://href.li/?https://twitter.com/RobinBoob"},"insert":"@RobinBoob"},{"insert":"."},{"attributes":{"blockquote":true},"insert":"\\n"}]';
export const ImageBugTest = () => {
  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          backgroundColor: "white",
          maxWidth: "500px",
          marginBottom: "15px",
          marginRight: "15px",
        }}
      >
        <Editor initialText={JSON.parse(IMAGE_BUG)} forceSSR={true} />
      </div>
    </div>
  );
};
