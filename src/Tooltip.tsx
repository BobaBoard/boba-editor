import React, {
  useRef,
  useState,
  forwardRef,
  useEffect,
  MutableRefObject as MRO,
} from "react";
const TenorKeyboard = require("./TenorKeyboard").default;
import classNames from "classnames";

console.log(TenorKeyboard);

// @ts-ignore
import GifImage from "./img/gif.svg";

import Quill from "quill";
let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
}

const Tooltip = forwardRef<
  HTMLDivElement,
  {
    show: boolean;
    onInsertEmbed: ({}: { type: string; embed: any }) => void;
    preventUpdate: (shouldPrevent: boolean) => void;
  }
>((props, ref) => {
  const [tenorOpen, setTenorOpen] = useState(false);
  const imageButton = useRef<HTMLButtonElement>() as MRO<HTMLButtonElement>;
  const tweetInput = useRef<HTMLButtonElement>() as MRO<HTMLButtonElement>;
  const gifButton = useRef<HTMLButtonElement>() as MRO<HTMLButtonElement>;
  const imageInput = useRef<HTMLInputElement>() as MRO<HTMLInputElement>;

  useEffect(() => {
    if (!imageButton.current || !tweetInput.current) {
      return;
    }
    imageButton.current.innerHTML = QuillModule.import("ui/icons")["image"];
    tweetInput.current.innerHTML = QuillModule.import("ui/icons")["tweet"];
  }, []);
  return (
    <>
      <div className="ql-bubble">
        <div
          className={classNames("tooltip ql-tooltip ql-toolbar", {
            hidden: !props.show,
          })}
          ref={ref}
        >
          <button
            className="ql-image"
            ref={imageButton as any}
            onClick={() => {
              imageInput.current.click();
            }}
          />
          <ImageLoader
            ref={imageInput}
            onImageLoaded={(image) => {
              props.onInsertEmbed({ type: "block-image", embed: image });
            }}
          />
          <button
            className="ql-image-gif ql-image"
            ref={gifButton}
            onClick={(e) => {
              props.preventUpdate(true);
              e.stopPropagation();
              setTenorOpen(true);
            }}
          >
            <GifImage key="gif_image" />
          </button>
          <button
            className="ql-tweet"
            ref={tweetInput}
            onClick={() => {
              // TODO: make a prettier input
              let url = prompt("Gimme a tweet url");
              if (url) {
                props.onInsertEmbed({ type: "tweet", embed: url });
              }
            }}
          />
          <TenorKeyboard
            isOpen={tenorOpen}
            target={gifButton}
            onClose={(result: any) => {
              props.preventUpdate(false);
              if (result) {
                props.onInsertEmbed({
                  type: "block-image",
                  embed: result.media[0].gif.url,
                });
              }
              setTenorOpen(false);
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
      `}</style>
    </>
  );
});

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
