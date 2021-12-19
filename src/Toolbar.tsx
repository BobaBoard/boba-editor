import React from "react";
import SpoilersIcon from "./img/spoilers.svg";
import classNames from "classnames";
import { removeListKeyboardBindings } from "./quillUtils";
import toolbarStyle from "./Toolbar.module.css";

export const Toolbar = React.forwardRef<
  HTMLDivElement,
  { loaded: boolean; singleLine: boolean }
>(({ loaded, singleLine }, ref) => {
  if (singleLine) {
    removeListKeyboardBindings();
  }
  return (
    <>
      <div
        className={classNames(toolbarStyle.toolbar, "ql-toolbar", {
          [toolbarStyle.loaded]: loaded,
        })}
        ref={ref}
      >
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link"></button>
          <button className="ql-inline-spoilers">
            <img src={SpoilersIcon} />
          </button>
        </span>
        <span className="ql-formats">
          {!singleLine && (
            <>
              <button className="ql-list" value="bullet"></button>
              <button className="ql-list" value="ordered"></button>
            </>
          )}
          <button className="ql-code"></button>
          <button className="ql-blockquote"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-header">
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-clean"></button>
        </span>
      </div>
    </>
  );
});
