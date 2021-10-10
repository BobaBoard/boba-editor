import {
  LEGACY_OPS_OBJECT,
  MULTILINE_TITLE,
  SPOILER_IMAGE,
  SPOILER_TEXT,
  SPOILER_TWEET,
  TEXT_WITH_IMAGE,
} from "../stories/data/deltas";
import { SPOILERS_IMAGE, getDeltaSummary } from "../src/semanticUtils";

describe("Semantic Utils", function () {
  it("Should not display spoilered text", function () {
    const converted = getDeltaSummary(SPOILER_TEXT);
    expect(converted.text).toEqual(
      "I have a secret\nThe truth is, I'm ██████████████████████████████████████████████.\n"
    );
  });
  it("Should not display spoilered image", function () {
    const converted = getDeltaSummary(SPOILER_IMAGE);
    expect(converted.images).toEqual([SPOILERS_IMAGE]);
  });
  it("Should display images", function () {
    const converted = getDeltaSummary(TEXT_WITH_IMAGE);
    expect(converted.images).toEqual([
      "https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png",
    ]);
  });
  it("Should correctly extract title", function () {
    const converted = getDeltaSummary(MULTILINE_TITLE);
    expect(converted.title).toEqual(
      "line (which can still have inline attributes)"
    );
  });
  it("Should not fail with an embed", function () {
    const converted = getDeltaSummary(SPOILER_TWEET);
    expect(converted.title).toEqual("Twitter Embed!");
  });
  it("Should not fail with a legacy ops object", function () {
    const converted = getDeltaSummary(LEGACY_OPS_OBJECT);
    expect(converted).toBeDefined();
  });
});
