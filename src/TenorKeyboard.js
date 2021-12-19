import React, { Component } from "react";

import Popup from "@atlaskit/popup";
import Tenor from "react-tenor";
import keyboardStyle from "./css/TenorKeyboard.module.css";

const gifJokes = [
  "Thank you, user! But your gif is in another castle!",
  "These aren't the gifs you're looking for.",
  "F",
  "I don't know what that is, I've never seen that.",
  "HQ! HQ! There's no gif here.",
  "You can't get ye gifs!",
  "The gif is a lie.",
  "You get a gif! You get a gif! Everyone gets... oh, you dont. Sorry.",
];

const TRIES = 10;
const TenorKeyboard = (props) => {
  const [joke, setJoke] = React.useState(gifJokes[0]);
  const tenor = React.useRef(null);
  const jokes = React.useRef(null);
  return (
    <>
      <Popup
        isOpen={props.isOpen}
        onClose={() => {
          props.onClose();
        }}
        placement="bottom-start"
        content={() => {
          let tries = TRIES;
          const maybeFocus = () => {
            if (tenor.current) {
              tenor.current.focus();
              let mountedSetState = tenor.current.mountedSetState;
              let handleSearchChange = tenor.current.handleSearchChange;
              tenor.current.handleSearchChange = (e) => {
                if (e.target.value == "") {
                  jokes.current.style.display = "none";
                }
                handleSearchChange.call(tenor.current, e);
              };
              tenor.current.mountedSetState = (status) => {
                if (status.pages && status.pages[0].results.length == 0) {
                  jokes.current.style.display = "block";
                  setJoke(
                    gifJokes[Math.floor(Math.random() * gifJokes.length)]
                  );
                } else {
                  jokes.current.style.display = "none";
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
              <div className={keyboardStyle["tenor-joke-container"]}>
                <div
                  className={keyboardStyle["tenor-joke"]}
                  ref={jokes}
                  style={{ display: "none" }}
                >
                  {joke}
                </div>
              </div>
            </div>
          );
        }}
        trigger={(triggerProps) => {
          if (props.target.current == null) {
            return null;
          }
          return (
            <div
              {...triggerProps}
              style={{
                position: "absolute",
                pointerEvents: "none",
                top: 0,
                right: 0,
                width: props.target.current.clientWidth + "px",
                opacity: 0,
                height: props.target.current.clientHeight + "px",
              }}
            />
          );
        }}
      />
    </>
  );
};

export default TenorKeyboard;
