import React, { Component } from "react";

import Tenor from "react-tenor";
import Popup from "@atlaskit/popup";

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
              console.log("try again");
              if (tries > 0) {
                setTimeout(maybeFocus, 50);
              }
              tries--;
            }
          };
          setTimeout(maybeFocus, 1);
          return (
            <div className="tenor-picker">
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
              <div className="tenor-joke-container">
                <div
                  className="tenor-joke"
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
      <style jsx>
        {`
          .tenor-picker {
            max-height: 300px;
            max-width: 100vw;
            width: 480px;
            border-radius: 3px;
            background: black;
            overflow-x: hidden;
          }
          .tenor-joke-container {
            background: black;
            text-align: center;
            color: gray;
            font-size: smaller;
            padding: 10px;
            height: 100px;
            position: relative;
          }
          .tenor-joke {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            padding: 5px;
            width: 100%;
          }
          :global(.react-tenor) {
            border: 0;
            background: black;
          }
          :global(.react-tenor),
          :global(.react-tenor--search),
          :global(.react-tenor--search-bar) {
            border-radius: 3px;
          }
          :global(.react-tenor-active) :global(.react-tenor--search),
          :global(.react-tenor-active) :global(.react-tenor--search-bar) {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
          :global(.react-tenor--search) {
            border: 0;
            background: #000000;
            color: white;
          }
          :global(.react-tenor--spinner) {
            top: 5px;
            right: 5px;
          }
          :global(.react-tenor--search:focus) {
            box-shadow: none;
          }
          :global(.react-tenor-active) {
            background: black;
          }
          :global(.react-tenor--results) {
            overflow-x: hidden;
          }
          :global(.react-tenor--autocomplete) {
            top: 0;
          }
          :global(.react-tenor--suggestions),
          .tenor-joke-container {
            border-top: 1px solid rgba(255, 255, 255, 0.2);
          }
          :global(.react-tenor--suggestions button) {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          :global(.react-tenor--suggestions button:hover) {
            background: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </>
  );
};

export default TenorKeyboard;
