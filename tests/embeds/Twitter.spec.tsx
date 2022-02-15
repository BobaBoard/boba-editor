import Editor, { EditorContext } from "../../src";

import { EditableEditorProps } from "Editor";
import React from "react";
import debug from "debug";
import { mount } from "@cypress/react";

const log = debug("boba-editor:cy:twitter");

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
      log(`Twitter library present: ${win["twttr"] !== undefined}`);
      return win["twttr"] !== undefined;
    });
  });
};

const loadTweet = ({
  tweetUrl,
  onTextChange,
}: {
  tweetUrl: string;
  onTextChange?: EditableEditorProps["onTextChange"];
}) => {
  mount(
    <EditorContext.Provider value={embedFetchers}>
      <Editor
        editable={true}
        onTextChange={(text) => {
          log(text);
          onTextChange?.(text);
        }}
        onIsEmptyChange={() => log("EmptyChange")}
      />
    </EditorContext.Provider>
  );

  cy.window().then((win) => {
    cy.stub(win, "prompt").returns(tweetUrl);
  });

  waitForTwitterScript();
  // Clicks on the empty editor, the tooltip should appear
  cy.get(".ql-editor").click();

  // Clicks on the twitter button
  const tooltipContaner = cy.findByLabelText("twitter");
  tooltipContaner.click();
};

it("Correctly loads twitter embeds dimensions", () => {
  const textChange = cy.spy();
  loadTweet({
    tweetUrl: "https://twitter.com/BobaBoard/status/1263913643650908160",
    onTextChange: textChange,
  });

  cy.get(".ql-tweet[data-rendered*=true]")
    .should("be.visible")
    .then(() => {
      log(textChange.lastCall);
      expect(
        textChange.lastCall.calledWithMatch({
          ops: [
            {
              insert: {
                tweet: {
                  url: "https://twitter.com/BobaBoard/status/1263913643650908160",
                  embedWidth: "469",
                  embedHeight: "635",
                  thread: false,
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

it("Correctly toggles spoilers on", () => {
  const textChange = cy.spy();
  loadTweet({
    tweetUrl: "https://twitter.com/BobaBoard/status/1263913643650908160",
    onTextChange: textChange,
  });

  cy.get(".ql-tweet[data-rendered*=true]")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-tweet[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          expect(
            textChange.lastCall.calledWithMatch({
              ops: [
                {
                  insert: {
                    tweet: {
                      url: "https://twitter.com/BobaBoard/status/1263913643650908160",
                      embedWidth: "469",
                      embedHeight: "635",
                      thread: false,
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

it("Correctly toggles spoilers off", () => {
  const textChange = cy.spy();
  loadTweet({
    tweetUrl: "https://twitter.com/BobaBoard/status/1263913643650908160",
    onTextChange: textChange,
  });

  cy.get(".ql-tweet[data-rendered*=true]")
    .should("be.visible")
    .then(() => {
      cy.findByLabelText("Toggle spoilers on").click();
      cy.get(".ql-tweet[data-spoilers*=true]")
        .should("be.visible")
        .then(() => {
          cy.findByLabelText("Toggle spoilers off").click();
          cy.get(".ql-tweet:not([data-spoilers*=true])")
            .should("be.visible")
            .then(() => {
              expect(
                textChange.lastCall.calledWithMatch({
                  ops: [
                    {
                      insert: {
                        tweet: {
                          url: "https://twitter.com/BobaBoard/status/1263913643650908160",
                          embedWidth: "469",
                          embedHeight: "635",
                          thread: false,
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

it("Correctly removes the tweet", () => {
  const textChange = cy.spy();
  loadTweet({
    tweetUrl: "https://twitter.com/BobaBoard/status/1263913643650908160",
    onTextChange: textChange,
  });

  cy.get(".ql-tweet[data-rendered*=true]")
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
