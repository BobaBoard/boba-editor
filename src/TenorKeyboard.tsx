import Tenor, { Result } from "react-tenor";

import { Popover } from "react-tiny-popover";
import React from "react";
import keyboardStyle from "./css/TenorKeyboard.module.css";

// const gifJokes = [
//   "Thank you, user! But your gif is in another castle!",
//   "These aren't the gifs you're looking for.",
//   "F",
//   "I don't know what that is, I've never seen that.",
//   "HQ! HQ! There's no gif here.",
//   "You can't get ye gifs!",
//   "The gif is a lie.",
//   "You get a gif! You get a gif! Everyone gets... oh, you dont. Sorry.",
// ];

const TRIES = 10;
const TenorKeyboard = (props: {
  isOpen: boolean;
  onClose: (gif?: Result) => void;
  target: React.MutableRefObject<HTMLElement>;
}) => {
  const tenor = React.useRef<Tenor>(null);
  const jokes = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <Popover
        isOpen={props.isOpen}
        onClickOutside={() => {
          props.onClose();
        }}
        positions={["bottom"]}
        align="start"
        content={() => {
          let tries = TRIES;
          const maybeFocus = () => {
            if (tenor.current) {
              tenor.current.focus();
              let mountedSetState = tenor.current.mountedSetState;
              let handleSearchChange = tenor.current.handleSearchChange;
              tenor.current.handleSearchChange = (e) => {
                if (e.target.value == "") {
                  jokes.current && (jokes.current.style.display = "none");
                }
                handleSearchChange.call(tenor.current, e);
              };
              tenor.current.mountedSetState = (status) => {
                // @ts-ignore
                if (status.pages && status.pages[0].results.length == 0) {
                  jokes.current && (jokes.current.style.display = "block");
                } else {
                  jokes.current && (jokes.current.style.display = "none");
                }
                mountedSetState.call(tenor.current, status);
              };
              return;
            } else {
              if (tries > 0) {
                setTimeout(maybeFocus, 50);
              }
              tries--;
            }
          };
          setTimeout(maybeFocus, 1);
          return (
            <div className={keyboardStyle["tenor-picker"]}>
              <div>
                <Tenor
                  key="tenor"
                  ref={tenor}
                  token="POOAW0CATU4O"
                  contentFilter="off"
                  onSelect={(result) => {
                    props.onClose(result);
                  }}
                />
              </div>
            </div>
          );
        }}
      >
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            top: 0,
            left: 0,
            width: (props.target.current?.clientWidth || 0) + "px",
            opacity: 0,
            height: (props.target.current?.clientHeight || 0) + "px",
          }}
        />
      </Popover>
    </>
  );
};

export default TenorKeyboard;
