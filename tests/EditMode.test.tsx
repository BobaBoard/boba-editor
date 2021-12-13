import "@testing-library/jest-dom/extend-expect";

import Editor, { EditorContext } from "../src";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";
import { action } from "@storybook/addon-actions";
import { mocked } from "ts-jest/utils";
import userEvent from "@testing-library/user-event";

jest.mock("@storybook/addon-actions");

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

test("Renders twitter embed", async () => {
  const actionReturn = jest.fn();
  mocked(action).mockReturnValue(actionReturn);

  const { debug } = render(
    <EditorContext.Provider value={embedFetchers}>
      <Editor
        editable={true}
        onTextChange={(text) => action("TextChange")(text)}
        onIsEmptyChange={action("EmptyChange")}
      />
    </EditorContext.Provider>
  );

  const editorContainer = document.querySelector(".ql-editor");
  expect(editorContainer).toBeInTheDocument();
  fireEvent.click(document.querySelector(".ql-editor p")!);
  //debug();

  const tooltipContaner = screen.getByLabelText("twitter");
  await waitFor(() => expect(tooltipContaner).toBeVisible());
});
