import { TooltipConfig } from "./config";

let RedditEmbed;
let TweetEmbed;
let PixivEmbed;
let InstagramEmbed;
let TumblrEmbed;
let TikTokEmbed;
let YouTubeEmbed;
let VimeoEmbed;

if (typeof window !== "undefined") {
  RedditEmbed = require("./custom-nodes/RedditEmbed").default;
  TweetEmbed = require("./custom-nodes/TweetEmbed").default;
  PixivEmbed = require("./custom-nodes/PixivEmbed").default;
  InstagramEmbed = require("./custom-nodes/InstagramEmbed").default;
  TumblrEmbed = require("./custom-nodes/TumblrEmbed").default;
  TikTokEmbed = require("./custom-nodes/TikTokEmbed").default;
  YouTubeEmbed = require("./custom-nodes/YouTubeEmbed").default;
  VimeoEmbed = require("./custom-nodes/VimeoEmbed").default;
}

// @ts-ignore
import YouTubeIcon from "./img/yt_icon.svg";
// @ts-ignore
import TumblrIcon from "./img/tumblr_icon.svg";
// @ts-ignore
import TiktokIcon from "./img/tiktok.svg";
// @ts-ignore
import TwitterIcon from "./img/twitter.svg";
// @ts-ignore
import RedditIcon from "./img/reddit.svg";
// @ts-ignore
import PixivIcon from "./img/pixiv.svg";
// @ts-ignore
import InstagramIcon from "./img/instagram.svg";
// @ts-ignore
import VimeoIcon from "./img/vimeo.svg";

export const defaultConfig: TooltipConfig = {
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
  ],
};
