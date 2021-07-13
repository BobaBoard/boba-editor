import React, { Component, forwardRef } from "react";
const TenorKeyboard = require("./TenorKeyboard").default;
import classNames from "classnames";
import { TooltipConfig, EmbedType, TooltipModule } from "./config";

// @ts-ignore
import GifImage from "./img/gif.svg";

import Quill from "quill";
import { EditorContextProps } from "../src/Editor";
let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
}

const error = require("debug")("bobapost:editor:tooltip-error");

class Tooltip extends Component<{
  config: TooltipConfig;
  show: boolean;
  top: number | undefined;
  right: number | undefined;
  onInsertEmbed: ({}: { type: string; embed: any }) => void;
  onSetFormat: (format: string) => void;
  preventUpdate: (shouldPrevent: boolean) => void;
  context: React.Context<EditorContextProps>;
}> {
  state = {
    tenorOpen: false,
  };

  gifButton = React.createRef<HTMLButtonElement>();
  imageInput = React.createRef<HTMLInputElement>();

  render() {
    let embedButtons = this.props.config.enabledEmbeds.map(
      (embed: EmbedType) => {
        let Icon = embed.icon;
        return (
          <button
            className={"ql-" + embed.embedName}
            key={embed.embedName}
            onClick={() => {
              // TODO: make a prettier input
              let url = prompt("Gimme a " + embed.embedName + " url");
              if (url) {
                this.props.onInsertEmbed({
                  type: embed.embedClass.blotName,
                  embed: { url },
                });
              }
            }}
          >
            <Icon key={embed.embedName} />
          </button>
        );
      }
    );
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
              className={classNames("ql-image", {
                hidden: !this.props.config.enabledModules.includes(
                  TooltipModule.IMAGE
                ),
              })}
              onClick={() => {
                this.imageInput.current?.click();
              }}
              dangerouslySetInnerHTML={{
                __html: QuillModule.import("ui/icons")["image"],
              }}
            />
            <ImageLoader
              ref={this.imageInput}
              onImageLoadStarts={(loadPromise) => {
                this.props.onInsertEmbed({
                  type: "block-image",
                  embed: { loadPromise },
                });
              }}
            />
            <button
              className={classNames("ql-image-gif ql-image", {
                hidden: !this.props.config.enabledModules.includes(
                  TooltipModule.GIF
                ),
              })}
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
              className={classNames("ql-blockquote", {
                hidden: !this.props.config.enabledModules.includes(
                  TooltipModule.QUOTE
                ),
              })}
              onClick={() => {
                this.props.onSetFormat("blockquote");
              }}
              dangerouslySetInnerHTML={{
                __html: QuillModule.import("ui/icons")["blockquote"],
              }}
            />
            <button
              className={classNames("ql-code-block", {
                hidden: !this.props.config.enabledModules.includes(
                  TooltipModule.CODEBLOCK
                ),
              })}
              onClick={() => {
                this.props.onSetFormat("code-block");
              }}
              dangerouslySetInnerHTML={{
                __html: QuillModule.import("ui/icons")["code-block"],
              }}
            />
            {embedButtons}
            {this.state.tenorOpen &&
              this.props.context?.render?.listSelect([
                {
                  id: "id",
                  name: "hello",
                },
              ])}
            {/* <TenorKeyboard
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
            /> */}
          </div>
        </div>
        <style jsx>{`
          .tooltip {
            position: absolute;
            z-index: 5;
            padding: 0 5px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            max-width: 70vw;
            transform: translateY(-5px);
          }
          .hidden {
            display: none !important;
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
  {
    onImageLoadStarts: (loadPromise: Promise<string | ArrayBuffer>) => void;
  }
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
          props.onImageLoadStarts(
            new Promise((resolve, reject) => {
              reader.onload = (e) => {
                if (!e.target?.result) {
                  return;
                }
                resolve(e.target.result);
                fileInput.value = "";
              };
              reader.onerror = (e) => {
                error(e);
                reject();
              };
            })
          );
          reader.readAsDataURL(fileInput.files[0]);
        }
      }}
    />
  );
});

export default Tooltip;
