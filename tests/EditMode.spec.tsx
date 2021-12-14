import Editor, { EditorContext } from "../src";

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

it("Correctly loads twitter embeds dimensions", () => {
  const textChange = cy.spy();
  mount(
    <EditorContext.Provider value={embedFetchers}>
      <Editor
        editable={true}
        onTextChange={(text) => {
          console.log(text);
          textChange(text);
        }}
        onIsEmptyChange={() => console.log("EmptyChange")}
      />
    </EditorContext.Provider>
  );

  waitForTwitterScript();
  cy.window().then((win) => {
    cy.stub(win, "prompt").returns(
      "https://twitter.com/BobaBoard/status/1263913643650908160"
    );
  });
  cy.get(".ql-editor").click();

  //debug();

  const tooltipContaner = cy.findByLabelText("twitter");
  tooltipContaner.click();

  cy.get(".ql-tweet[data-rendered*=true]")
    .should("be.visible")
    .then(() => {
      console.log(textChange.lastCall);
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
