import React from "react";
//import { linkTo } from "@storybook/addon-links";
import BoardPreview from "../src/BoardPreview";

export default {
  title: "Board Preview",
  component: BoardPreview,
};

export const BoardPreviewSimple = () => (
  <BoardPreview
    slug="gore"
    avatar={require("./images/gore.png")}
    onClick={() => console.log("go!")}
  />
);

BoardPreviewSimple.story = {
  name: "simple",
};
