import type { DeltaOperation } from "quill";

export const MULTILINE_TITLE: DeltaOperation[] = [
  {
    insert:
      "When a insert operation contains only a single '\\n' its attributes apply to the whole previous \n",
  },
  { insert: "line (which can still have " },
  { insert: "inline attributes", attributes: { bold: true } },
  { insert: ")" },
  { insert: "\n", attributes: { header: 1 } },
  { insert: "!" },
];

export const TEXT_WITH_IMAGE: DeltaOperation[] = [
  { insert: "Open RP" },
  { attributes: { header: 1 }, insert: "\n" },
  {
    insert: {
      "block-image": {
        src: "https://cdn.discordapp.com/attachments/443967088118333442/691486081895628830/unknown.png",
        width: 3840,
        height: 2160,
      },
    },
  },
  { attributes: { italic: true }, insert: "You have my sword..." },
];
/**
 *
 * SPOILERS DELTAS
 *
 */

export const SPOILER_TEXT: DeltaOperation[] = [
  { insert: "I have a secret" },
  { attributes: { header: 1 }, insert: "\n" },
  { attributes: { italic: true }, insert: "The truth is, I'm " },
  {
    attributes: { italic: true, "inline-spoilers": true },
    insert: "tormented by Solid Snake's Perfect Bubble Butt",
  },
  { attributes: { italic: true }, insert: "." },
  { insert: "\n" },
];

export const SPOILER_IMAGE: DeltaOperation[] = [
  { insert: "I have a secret" },
  { attributes: { header: 1 }, insert: "\n" },
  {
    insert: {
      "block-image": {
        src: "https://media.tenor.com/images/caee629b8e640f7217b2b4b9bda49bac/tenor.gif",
        spoilers: true,
        width: 498,
        height: 392,
      },
    },
  },
  { attributes: { italic: true }, insert: "The truth is, I'm " },
  {
    attributes: { "inline-spoilers": true, italic: true },
    insert: "tormented by Solid Snake's Perfect Bubble Butt",
  },
  { attributes: { italic: true }, insert: "." },
  { insert: "\\n" },
];

export const SPOILER_TWEET: DeltaOperation[] = [
  { insert: "Twitter Embed!" },
  { attributes: { header: 1 }, insert: "\n" },
  {
    insert: {
      tweet: {
        thread: true,
        spoilers: true,
        embedHeight: "689",
        embedWidth: "500",
        url: "https://twitter.com/hasenschneck/status/1311215026506784768",
      },
    },
  },
  { insert: "\n" },
];

/**
 *
 * LEGACY DELTAS
 *
 */

// This image uses block-image directly as a string rather than having block-image as an object
export const IMAGE_LEGACY: DeltaOperation[] = [
  { insert: "I have a secret" },
  { attributes: { header: 1 }, insert: "\n" },
  {
    insert: {
      "block-image":
        "https://media.tenor.com/images/caee629b8e640f7217b2b4b9bda49bac/tenor.gif",
    },
  },
  { attributes: { italic: true }, insert: "The truth is, I'm " },
  {
    attributes: { "inline-spoilers": true, italic: true },
    insert: "tormented by Solid Snake's Perfect Bubble Butt",
  },
  { attributes: { italic: true }, insert: "." },
  { insert: "\n" },
];

export const LEGACY_OPS_OBJECT: { ops: DeltaOperation[] } = {
  ops: MULTILINE_TITLE,
};
