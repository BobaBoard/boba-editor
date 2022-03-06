import { TooltipConfig, TooltipModule } from "./config";

import ExternalEmbedIcon from "./img/external_embed.svg";
import InstagramIcon from "./img/instagram.svg";
import PixivIcon from "./img/pixiv.svg";
import RedditIcon from "./img/reddit.svg";
import TiktokIcon from "./img/tiktok.svg";
import TumblrIcon from "./img/tumblr_icon.svg";
import TwitterIcon from "./img/twitter.svg";
import VimeoIcon from "./img/vimeo.svg";
import YouTubeIcon from "./img/yt_icon.svg";

let RedditEmbed;
let TweetEmbed;
let PixivEmbed;
let InstagramEmbed;
let TumblrEmbed;
let TikTokEmbed;
let YouTubeEmbed;
let VimeoEmbed;
let OEmbedEmbed;

if (typeof window !== "undefined") {
  RedditEmbed = require("./custom-nodes/RedditEmbed").default;
  TweetEmbed = require("./custom-nodes/TweetEmbed").default;
  PixivEmbed = require("./custom-nodes/PixivEmbed").default;
  InstagramEmbed = require("./custom-nodes/InstagramEmbed").default;
  TumblrEmbed = require("./custom-nodes/TumblrEmbed").default;
  TikTokEmbed = require("./custom-nodes/TikTokEmbed").default;
  YouTubeEmbed = require("./custom-nodes/YouTubeEmbed").default;
  VimeoEmbed = require("./custom-nodes/VimeoEmbed").default;
  OEmbedEmbed = require("./custom-nodes/OEmbedBase").default;
}

export const defaultConfig: TooltipConfig = {
  enabledModules: [
    TooltipModule.IMAGE,
    TooltipModule.GIF,
    TooltipModule.CODEBLOCK,
    TooltipModule.QUOTE,
  ],
  enabledEmbeds: [
    {
      embedName: "twitter",
      embedClass: TweetEmbed,
      icon: TwitterIcon,
    },
    {
      embedName: "reddit",
      embedClass: RedditEmbed,
      icon: RedditIcon,
    },
    {
      embedName: "pixiv",
      embedClass: PixivEmbed,
      icon: PixivIcon,
    },
    {
      embedName: "instagram",
      embedClass: InstagramEmbed,
      icon: InstagramIcon,
    },
    {
      embedName: "tumblr",
      embedClass: TumblrEmbed,
      icon: TumblrIcon,
    },
    {
      embedName: "tiktok",
      embedClass: TikTokEmbed,
      icon: TiktokIcon,
    },
    {
      embedName: "vimeo",
      embedClass: VimeoEmbed,
      icon: VimeoIcon,
    },
    {
      embedName: "youtube",
      embedClass: YouTubeEmbed,
      icon: YouTubeIcon,
    },
    {
      embedName: "generic",
      embedClass: OEmbedEmbed,
      icon: ExternalEmbedIcon,
    },
  ],
};

export const singleLineConfig: TooltipConfig = {
  enabledModules: [TooltipModule.IMAGE, TooltipModule.GIF],
  enabledEmbeds: [],
};
