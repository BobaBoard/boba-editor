import React from "react";
//import { linkTo } from "@storybook/addon-links";
import BoardPreview from "../src/BoardPreview";

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
  />
);

BoardPreviewSimple.story = {
  name: "simple",
};
