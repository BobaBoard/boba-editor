import Editor, { EditorContext } from "../../src";

import { EditableEditorProps } from "Editor";
import React from "react";
import { mount } from "@cypress/react";

const REMOTE_EMBEDS_URL = `https://boba-embeds.herokuapp.com/iframely`;

const embedFetchers = {
  fetchers: {
    getOEmbedFromUrl: (url: string) => {
      const LOAD_DELAY = 1000;
      const promise = new Promise((resolve, reject) => {
        fetch(`${REMOTE_EMBEDS_URL}?uri=${url}`)
          .then((response) => {
            setTimeout(() => {
              resolve(response.json());
            }, LOAD_DELAY);
          })
          .catch((error) => {
            reject(error);
          });
      });
      return promise;
    },
  },
};

const loadTumblrPost = ({
  postUrl,
  onTextChange,
}: {
  postUrl: string;
  onTextChange?: EditableEditorProps["onTextChange"];
}) => {
  mount(
    <EditorContext.Provider value={embedFetchers}>
      <Editor
        editable={true}
        onTextChange={(text) => {
          console.log(text);
          onTextChange?.(text);
        }}
        onIsEmptyChange={() => console.log("EmptyChange")}
      />
    </EditorContext.Provider>
  );

  cy.window().then((win) => {
    cy.stub(win, "prompt").returns(postUrl);
  });

  // Clicks on the empty editor, the tooltip should appear
  cy.get(".ql-editor").click();

  // Clicks on the tumblr button
  const tooltipContaner = cy.findByLabelText("tumblr");
  tooltipContaner.click();
};

it(
  "Correctly loads Tumblr post with dimensions",
  {
    defaultCommandTimeout: 10000,
  },
  () => {
    const textChange = cy.spy();
    loadTumblrPost({
      postUrl:
        "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
      onTextChange: textChange,
    });

    cy.get(".ql-tumblr-embed.size-loaded")
      .should("be.visible")
      .then(() => {
        expect(
          textChange.lastCall.calledWithMatch({
            ops: [
              {
                insert: {
                  "tumblr-embed": {
                    did: "211b71f5c49a42458fc23a95335d65c4331e91b4",
                    embedHeight: "1174",
                    embedWidth: "469",
                    href: "https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824",
                    spoilers: false,
                    url: "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
                  },
                },
              },
              {
                insert: "\n",
              },
            ],
          })
        ).to.be.true;
      });
  }
);

it("Correctly toggles Tumblr embed spoilers on", () => {
  const textChange = cy.spy();
  loadTumblrPost({
    postUrl:
      "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
    onTextChange: textChange,
  });

  cy.get(".ql-tumblr-embed.size-loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-tumblr-embed[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          expect(
            textChange.lastCall.calledWithMatch({
              ops: [
                {
                  insert: {
                    "tumblr-embed": {
                      did: "211b71f5c49a42458fc23a95335d65c4331e91b4",
                      embedHeight: "1174",
                      embedWidth: "469",
                      href: "https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824",
                      spoilers: true,
                      url: "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
                    },
                  },
                },
                {
                  insert: "\n",
                },
              ],
            })
          ).to.be.true;
        });
    });
});

it("Correctly toggles Tumblr embed spoilers off", () => {
  const textChange = cy.spy();
  loadTumblrPost({
    postUrl:
      "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
    onTextChange: textChange,
  });

  cy.get(".ql-tumblr-embed.size-loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-tumblr-embed[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          cy.findByLabelText("Toggle spoilers off").click();
          cy.get(".ql-tumblr-embed:not([data-spoilers*=true])")
            .should("be.visible")
            .then(() => {
              expect(
                textChange.lastCall.calledWithMatch({
                  ops: [
                    {
                      insert: {
                        "tumblr-embed": {
                          did: "211b71f5c49a42458fc23a95335d65c4331e91b4",
                          embedHeight: "1174",
                          embedWidth: "469",
                          href: "https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824",
                          spoilers: false,
                          url: "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
                        },
                      },
                    },
                    {
                      insert: "\n",
                    },
                  ],
                })
              ).to.be.true;
            });
        });
    });
});

it("Correctly removes the Tumblr embed", () => {
  const textChange = cy.spy();
  loadTumblrPost({
    postUrl:
      "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
    onTextChange: textChange,
  });

  cy.get(".ql-tumblr-embed.size-loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Delete embed").click();
      cy.get(".ql-tumblr-embed")
        .should("not.exist")
        .then(() => {
          expect(
            textChange.lastCall.calledWithMatch({
              ops: [
                {
                  insert: "\n",
                },
              ],
            })
          ).to.be.true;
        });
    });
});

// TODO: figure out how to measure the embed
// it("Correctly loads the Tumblr embed with the appropriate width and height", () => {
//   const textChange = cy.spy();
//   loadDelta({
//     initialText: {
//       ops: [
//         {
//           insert: {
//             "tumblr-embed": {
//               did: "211b71f5c49a42458fc23a95335d65c4331e91b4",
//               embedHeight: "1174",
//               embedWidth: "469",
//               href: "https://embed.tumblr.com/embed/post/1DU3s2LW_74-QOcKbxGMsw/647298900927053824",
//               spoilers: false,
//               url: "https://bobaboard.tumblr.com/post/647298900927053824/this-april-1st-bobaboard-is-proud-to-bring-its",
//             },
//           },
//         },
//         {
//           insert: "\n",
//         },
//       ],
//     },
//   });

//   cy.get(".ql-embed.loading")
//     .should("be.visible")
//     .then(() => {
//       cy.findByLabelText("Delete embed").click();
//       cy.get(".ql-tumblr-embed")
//         .should("not.exist")
//         .then(() => {
//           expect(
//             textChange.lastCall.calledWithMatch({
//               ops: [
//                 {
//                   insert: "\n",
//                 },
//               ],
//             })
//           ).to.be.true;
//         });
//     });
// });
