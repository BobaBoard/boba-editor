import React from "react";
//import { linkTo } from "@storybook/addon-links";
import { Editor } from "../src";

export default {
  title: "Editor Preview",
  component: Editor,
};

export const EditorSimple = () => <Editor />;

EditorSimple.story = {
  name: "simple",
};
