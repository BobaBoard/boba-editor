import "@testing-library/jest-dom/extend-expect";

import * as stories from "../../stories/1-Embeds.stories";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";
import { act } from "react-dom/test-utils";
import { action } from "@storybook/addon-actions";
import { composeStories } from "@storybook/testing-react";

const { BlockImageEmbed } = composeStories(stories);

beforeAll(() => {
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = () => {
      return {
        x: 0,
        y: 0,
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
        toJSON: jest.fn(),
      };
    };

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };
});

// TODO: change these with actual testing library methods

describe("Block Image", () => {
  test("Correctly renders loading image snapshot", async () => {
    const { baseElement } = render(<BlockImageEmbed />);
    expect(baseElement.querySelector(".block-image-class")).
toMatchInlineSnapshot(`
<div
  class="block-image-class ql-block-image ql-embed loading"
  contenteditable="false"
>
  <div
    class="spinner"
  />
  <div
    class="embed-overlay"
  >
    <button
      aria-label="Delete embed"
      class="close-button"
    >
      <img
        src="close.svg"
      />
    </button>
    <div
      class="options-overlay"
    >
      <template
        class="option-template"
      />
      <button
        aria-label="Toggle spoilers on"
        class="spoilers-button embed-options-button"
      >
        <img
          src="spoilers.svg"
        />
      </button>
    </div>
  </div>
  <img
    class="image"
    height=""
    src="https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
    width=""
  />
</div>
`);
  });

  test("Correctly renders loaded image snapshot", async () => {
    const { baseElement } = render(<BlockImageEmbed />);
    const image = baseElement.querySelector("img.image") as HTMLImageElement;
    act(() => {
      const event: any = {};
      image.onload(event);
    });
    expect(baseElement.querySelector(".block-image-class")).
toMatchInlineSnapshot(`
<div
  class="block-image-class ql-block-image ql-embed"
  contenteditable="false"
>
  <div
    class="embed-overlay"
  >
    <button
      aria-label="Delete embed"
      class="close-button"
    >
      <img
        src="close.svg"
      />
    </button>
    <div
      class="options-overlay"
    >
      <template
        class="option-template"
      />
      <button
        aria-label="Toggle spoilers on"
        class="spoilers-button embed-options-button"
      >
        <img
          src="spoilers.svg"
        />
      </button>
    </div>
  </div>
  <img
    class="image"
    height=""
    src="https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
    width=""
  />
</div>
`);
  });

  test("Correctly renders spoilered image snapshot", async () => {
    const { baseElement } = render(<BlockImageEmbed />);
    const image = baseElement.querySelector("img.image") as HTMLImageElement;
    act(() => {
      const event: any = {};
      image.onload(event);
    });

    fireEvent.click(baseElement.querySelector(".spoilers-button"));

    expect(baseElement.querySelector(".block-image-class")).
toMatchInlineSnapshot(`
<div
  class="block-image-class ql-block-image ql-embed"
  contenteditable="false"
  spoilers="true"
>
  <div
    class="embed-overlay spoilers"
  >
    <button
      aria-label="Delete embed"
      class="close-button"
    >
      <img
        src="close.svg"
      />
    </button>
    <div
      class="options-overlay"
    >
      <template
        class="option-template"
      />
      <button
        aria-label="Toggle spoilers off"
        class="spoilers-button embed-options-button active"
      >
        <img
          src="spoilers.svg"
        />
      </button>
    </div>
  </div>
  <img
    class="image"
    height=""
    src="https://pbs.twimg.com/media/EY-RqiyUwAAfgzd?format=png&name=small"
    width=""
  />
</div>
`);
  });
});
