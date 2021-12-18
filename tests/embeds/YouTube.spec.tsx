import Editor, { EditorContext } from "../../src";

import { EditableEditorProps } from "Editor";
import React from "react";
import { mount } from "@cypress/react";
import { text } from "cheerio/lib/api/manipulation";

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

const waitForTwitterScript = () => {
  cy.window().then((win) => {
    if (!win["twttr"]) {
      const twitterLibrary = win.document.createElement("script");
      twitterLibrary.src = "https://platform.twitter.com/widgets.js";
      win.document.body.appendChild(twitterLibrary);
    }
  });
  cy.waitUntil(() => {
    return cy.window().then((win) => {
      return win["twttr"] !== undefined;
    });
  });
};

const loadYouTubeVideo = ({
  videoUrl,
  onTextChange,
}: {
  videoUrl: string;
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
    cy.stub(win, "prompt").returns(videoUrl);
  });

  //waitForTwitterScript();
  // Clicks on the empty editor, the tooltip should appear
  cy.get(".ql-editor").click();

  // Clicks on the twitter button
  const tooltipContaner = cy.findByLabelText("youtube");
  tooltipContaner.click();
};

it("Correctly loads YouTube video dimensions", () => {
  const textChange = cy.spy();
  loadYouTubeVideo({
    videoUrl: "https://www.youtube.com/watch?v=EuRwxzKt0vo",
    onTextChange: textChange,
  });

  cy.get(".ql-youtube-video")
    .should("be.visible")
    .then(() => {
      console.log(textChange.lastCall);
      expect(
        textChange.lastCall.calledWithMatch({
          ops: [
            {
              insert: {
                "youtube-video": {
                  url: "https://www.youtube.com/embed/EuRwxzKt0vo",
                  spoilers: false,
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

it("Correctly toggles YouTube video spoilers on", () => {
  const textChange = cy.spy();
  loadYouTubeVideo({
    videoUrl: "https://www.youtube.com/watch?v=EuRwxzKt0vo",
    onTextChange: textChange,
  });

  cy.get(".ql-youtube-video")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-youtube-video[spoilers*=true]")
        .should("be.visible")
        .then(() => {
          expect(
            textChange.lastCall.calledWithMatch({
              ops: [
                {
                  insert: {
                    "youtube-video": {
                      url: "https://www.youtube.com/embed/EuRwxzKt0vo",
                      spoilers: true,
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

it("Correctly toggles YouTube video spoilers off", () => {
  const textChange = cy.spy();
  loadYouTubeVideo({
    videoUrl: "https://www.youtube.com/watch?v=EuRwxzKt0vo",
    onTextChange: textChange,
  });

  cy.get(".ql-youtube-video")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-youtube-video[spoilers*=true]")
        .should("be.visible")
        .then(() => {
          cy.findByLabelText("Toggle spoilers off").click();
          cy.get(".ql-youtube-video:not([spoilers*=true])")
            .should("be.visible")
            .then(() => {
              expect(
                textChange.lastCall.calledWithMatch({
                  ops: [
                    {
                      insert: {
                        "youtube-video": {
                          url: "https://www.youtube.com/embed/EuRwxzKt0vo",
                          spoilers: false,
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

it("Correctly removes the YouTube video", () => {
  const textChange = cy.spy();
  loadYouTubeVideo({
    videoUrl: "https://www.youtube.com/watch?v=EuRwxzKt0vo",
    onTextChange: textChange,
  });

  cy.get(".ql-youtube-video")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Delete embed").click();
      cy.get(".ql-tweet")
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
