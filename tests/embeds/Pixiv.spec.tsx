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

const loadPixivEmbed = ({
  pixivUrl,
  onTextChange,
}: {
  pixivUrl: string;
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
    cy.stub(win, "prompt").returns(pixivUrl);
  });

  // Clicks on the empty editor, the tooltip should appear
  cy.get(".ql-editor").click();

  // Clicks on the twitter button
  const tooltipContaner = cy.findByLabelText("pixiv");
  tooltipContaner.click();
};

it("Correctly loads Pixiv embed dimensions", () => {
  const textChange = cy.spy();
  loadPixivEmbed({
    pixivUrl: "https://www.pixiv.net/en/artworks/92394928",
    onTextChange: textChange,
  });

  cy.get(".ql-pixiv-embed.loaded")
    .should("be.visible")
    .then(() => {
      console.log(textChange.lastCall);
      expect(
        textChange.lastCall.calledWithMatch({
          ops: [
            {
              insert: {
                "pixiv-embed": {
                  url: "https://www.pixiv.net/en/artworks/92394928",
                  spoilers: false,
                  embedHeight: "255",
                  embedWidth: "484",
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

it("Correctly toggles Pixiv embeds spoilers on", () => {
  const textChange = cy.spy();
  loadPixivEmbed({
    pixivUrl: "https://www.pixiv.net/en/artworks/92394928",
    onTextChange: textChange,
  });

  cy.get(".ql-pixiv-embed.loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-pixiv-embed[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          expect(
            textChange.lastCall.calledWithMatch({
              ops: [
                {
                  insert: {
                    "pixiv-embed": {
                      url: "https://www.pixiv.net/en/artworks/92394928",
                      spoilers: true,
                      embedHeight: "255",
                      embedWidth: "484",
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

it("Correctly toggles Pixiv embed spoilers off", () => {
  const textChange = cy.spy();
  loadPixivEmbed({
    pixivUrl: "https://www.pixiv.net/en/artworks/92394928",
    onTextChange: textChange,
  });

  cy.get(".ql-pixiv-embed.loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-pixiv-embed[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          cy.findByLabelText("Toggle spoilers off").click();
          cy.get(".ql-pixiv-embed:not([data-spoilers*=true])")
            .should("be.visible")
            .then(() => {
              expect(
                textChange.lastCall.calledWithMatch({
                  ops: [
                    {
                      insert: {
                        "pixiv-embed": {
                          url: "https://www.pixiv.net/en/artworks/92394928",
                          spoilers: false,
                          embedHeight: "255",
                          embedWidth: "484",
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

it("Correctly removes the Pixiv embed", () => {
  const textChange = cy.spy();
  loadPixivEmbed({
    pixivUrl: "https://www.pixiv.net/en/artworks/92394928",
    onTextChange: textChange,
  });

  cy.get(".ql-pixiv-embed.loaded")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Delete embed").click();
      cy.get(".ql-youtube-video")
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
