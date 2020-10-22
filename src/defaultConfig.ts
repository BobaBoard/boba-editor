import { TooltipConfig } from "./config";

import RedditEmbed from "./custom-nodes/RedditEmbed";
import TweetEmbed from "./custom-nodes/TweetEmbed";
import PixivEmbed from "./custom-nodes/PixivEmbed";
import InstagramEmbed from "./custom-nodes/InstagramEmbed";
import TumblrEmbed from "./custom-nodes/TumblrEmbed";
import TikTokEmbed from "./custom-nodes/TikTokEmbed";
import YouTubeEmbed from "./custom-nodes/YouTubeEmbed";
import VimeoEmbed from "./custom-nodes/VimeoEmbed";

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
            icon: TwitterIcon
        },
        {
            embedName: "reddit",
            embedClass: RedditEmbed,
            icon: RedditIcon
        },
        {
            embedName: "pixiv",
            embedClass: PixivEmbed,
            icon: PixivIcon
        },
        {
            embedName: "instagram",
            embedClass: InstagramEmbed,
            icon: InstagramIcon
        },
        {
            embedName: "tumblr",
            embedClass: TumblrEmbed,
            icon: TumblrIcon
        },
        {
            embedName: "tiktok",
            embedClass: TikTokEmbed,
            icon: TiktokIcon
        },
        {
            embedName: "vimeo",
            embedClass: VimeoEmbed,
            icon: VimeoIcon
        },
        {
            embedName: "youtube",
            embedClass: YouTubeEmbed,
            icon: YouTubeIcon
        }

    ]
};