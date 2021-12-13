import { getSsrConverter } from "../src/ssrUtils";

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
    {"insert":"Also this one above is a single line break, while the one below is two:\\n\\nAnd here we have "},
    {"insert":"spoilers", "attributes":{"inline-spoilers": true}},
    {"insert":"!", "attributes":{"inline-spoilers": true, "italic": true}},
    {"insert":"!", "attributes":{"inline-spoilers": true, "italic": false}},
    {"insert":"!", "attributes":{"inline-spoilers": true, "italic": true}},
    {"insert":" and "},
    {"insert":"more spoilers!", "attributes":{"inline-spoilers": true, "italic": false}},
    {"insert":"!", "attributes":{"inline-spoilers": true, "italic": true}},
    {"insert":"!", "attributes":{"inline-spoilers": true, "italic": false}},
    {"insert":"\\nImage? No "},
    {"attributes":{"link":"www.goojdkajdslaksdjaklsdjaklsdjaskldjaskldjaslkdjaskldjaskl…kdjalskdjaksldjaslkdjalksdjalksdjaslkdjalskdjaslkdjlkgle.com"},"insert":"problem"},
    {"insert":"! Just pay attention to the extra empty line at the end!\\n"},
    {"insert":{"block-image":{"src":"https://media.tenor.com/images/74905779610f0b24e5a4443f564398e6/tenor.gif","spoilers":true,"width":100,"height":100}}},
    {"attributes":{"italic":true},"insert":"This is a blockquote"},{"attributes":{"blockquote":true},"insert":"\\n"}
  ]`;

describe("SSR tests", function () {
  it("should convert to HTML", function () {
    const converted = getSsrConverter().convert(JSON.parse(longText));
    expect(converted).toMatchInlineSnapshot(
      `"<h1>This is a H1 Header</h1><h2>This is a H2 Header</h2><h3>This is a H3 Header</h3><p>Some lists now: </p><ul><li>You have my sword...</li><li>this is a long paragraph which is used to test the right m (argin) on this type of list.</li></ul><p>More lists now: </p><ol><li>asdasd</li><li>adsdasdas</li></ol><p>Blockquote: </p><blockquote><em>This is a blockquote</em></blockquote><blockquote><em>A beautiful blockquote</em></blockquote><blockquote>Hello look at this blockquote</blockquote><p>Codeblock: </p><pre class=\\"ql-syntax\\">This is code block</pre><p>And this has some <code>inline code</code></p><p>Also this one above is a single line break, while the one below is two:</p><p><br></p><p>And here we have <span class=\\"inline-spoilers\\">spoilers<em class=\\"\\">!</em>!<em class=\\"\\">!</em></span> and <span class=\\"inline-spoilers\\">more spoilers!<em class=\\"\\">!</em>!</span></p><p>Image? No <a href=\\"unsafe:www.goojdkajdslaksdjaklsdjaklsdjaskldjaskldjaslkdjaskldjaskl…kdjalskdjaksldjaslkdjalksdjalksdjaslkdjalskdjaslkdjlkgle.com\\" target=\\"_blank\\">problem</a>! Just pay attention to the extra empty line at the end!</p><div class=\\"block-image-class ql-block-image ql-embed spoilers\\" contenteditable=\\"false\\"><div class=\\"embed-overlay\\" style=\\"width:100%;height:100px;\\"></div><img src=\\"https://media.tenor.com/images/74905779610f0b24e5a4443f564398e6/tenor.gif\\" width=\\"100px\\" height=\\"100px\\" /></div><blockquote><em>This is a blockquote</em></blockquote>"`
    );
  });
});
