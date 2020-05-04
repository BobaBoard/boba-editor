import React from "react";
//import { linkTo } from "@storybook/addon-links";
import BoardPreview from "../src/BoardPreview";
import Tag from "../src/Tag";

import goreBackground from "./images/gore.png";

export default {
  title: "Board Preview",
  component: BoardPreview,
};

export const BoardPreviewSimple = () => (
  <BoardPreview
    slug="gore"
    avatar={`/${goreBackground}`}
    onClick={() => console.log("go!")}
  ></BoardPreview>
);

BoardPreviewSimple.story = {
  name: "simple",
};

export const BoardPreviewWithTags = () => (
  <BoardPreview
    slug="gore"
    avatar={`/${goreBackground}`}
    onClick={() => console.log("go!")}
  >
    <Tag name="blood" color="#f96680" />
    <Tag name="knifeplay" color="#93b3b0" />
    <Tag name="aesthetic" color="#24d282" />
  </BoardPreview>
);

BoardPreviewWithTags.story = {
  name: "with tags",
};
