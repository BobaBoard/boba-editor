import React, { Component, forwardRef } from "react";
const TenorKeyboard = require("./TenorKeyboard").default;
import classNames from "classnames";

// @ts-ignore
import GifImage from "./img/gif.svg";
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

import Quill from "quill";
let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
}

class Tooltip extends Component<{
  show: boolean;
  top: number | undefined;
  right: number | undefined;
  onInsertEmbed: ({}: { type: string; embed: any }) => void;
  preventUpdate: (shouldPrevent: boolean) => void;
}> {
  state = {
    tenorOpen: false,
  };

  gifButton = React.createRef<HTMLButtonElement>();
  imageInput = React.createRef<HTMLInputElement>();

  render() {
    return (
      <>
        <div className="ql-bubble">
          <div
            className={classNames("tooltip ql-tooltip ql-toolbar", {
              hidden: !this.props.show,
            })}
            style={{
              top: `${this.props.top}px`,
              right: `${this.props.right}px`,
            }}
          >
            <button
              className="ql-image"
              onClick={() => {
                this.imageInput.current?.click();
              }}
              dangerouslySetInnerHTML={{
                __html: QuillModule.import("ui/icons")["image"],
              }}
            />
            <ImageLoader
              ref={this.imageInput}
              onImageLoaded={(image) => {
                this.props.onInsertEmbed({ type: "block-image", embed: image });
              }}
            />
            <button
              className="ql-image-gif ql-image"
              ref={this.gifButton}
              onClick={(e) => {
                this.props.preventUpdate(true);
                e.stopPropagation();
                this.setState({ tenorOpen: true });
              }}
            >
              <GifImage key="gif_image" />
            </button>
            <button
              className="ql-tweet"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a tweet url");
                if (url) {
                  this.props.onInsertEmbed({ type: "tweet", embed: url });
                }
              }}
            >
              <TwitterIcon key="twitter" />
            </button>
            <button
              className="ql-reddit"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a reddit url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "reddit-embed",
                    embed: { url },
                  });
                }
              }}
            >
              <RedditIcon key="reddit" />
            </button>
            <button
              className="ql-pixiv"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a pixiv url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "pixiv-embed",
                    embed: { url },
                  });
                }
              }}
            >
              <PixivIcon key="pixiv" />
            </button>
            <button
              className="ql-instagram"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a instagram url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "instagram-embed",
                    embed: { url },
                  });
                }
              }}
            >
              <InstagramIcon key="instagram" />
            </button>
            <button
              className="ql-tumblr"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a tumblr url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "tumblr-embed",
                    embed: url,
                  });
                }
              }}
            >
              <TumblrIcon key="tumblr_icon" />
            </button>
            <button
              className="ql-tiktok"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a TikTok url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "tiktok-embed",
                    embed: url,
                  });
                }
              }}
            >
              <TiktokIcon key="tiktok_icon" />
            </button>
            <button
              className="ql-youtube"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a YouTube url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "youtube-video",
                    embed: url,
                  });
                }
              }}
            >
              <YouTubeIcon key="youtube_icon" />
            </button>
            <button
              className="ql-vimeo"
              onClick={() => {
                // TODO: make a prettier input
                let url = prompt("Gimme a vimeo url");
                if (url) {
                  this.props.onInsertEmbed({
                    type: "vimeo-embed",
                    embed: { url },
                  });
                }
              }}
            >
              <VimeoIcon key="vimeo" />
            </button>
            <TenorKeyboard
              isOpen={this.state.tenorOpen}
              target={this.gifButton}
              onClose={(result: any) => {
                this.props.preventUpdate(false);
                if (result) {
                  this.props.onInsertEmbed({
                    type: "block-image",
                    embed: result.media[0].gif.url,
                  });
                }
                this.setState({ tenorOpen: false });
              }}
            />
          </div>
        </div>
        <style jsx>{`
          .tooltip {
            position: absolute;
            z-index: 5;
            height: 25px;
            padding: 0 5px;
            display: block;
            transform: translateY(-5px);
          }
          .tooltip.hidden {
            display: none;
          }
          :global(.ql-tumblr) {
            padding: 4px 7px;
            margin-top: 1px;
          }
        `}</style>
      </>
    );
  }
}

const ImageLoader = forwardRef<
  HTMLInputElement,
  { onImageLoaded: (img: string | ArrayBuffer) => void }
>((props, ref) => {
  return (
    <input
      ref={ref}
      className="ql-image"
      type="file"
      accept="image/png, image/gif, image/jpeg, image/bmp, image/x-icon"
      onChange={(e) => {
        const fileInput = e.target;
        if (fileInput.files != null && fileInput.files[0] != null) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (!e.target?.result) {
              return;
            }
            props.onImageLoaded(e.target.result);
            fileInput.value = "";
          };
          reader.readAsDataURL(fileInput.files[0]);
        }
      }}
    />
  );
});

export default Tooltip;
