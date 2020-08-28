import React, { Component, createRef, forwardRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import classNames from "classnames";
import {
  detectNewLine,
  withKeyboardSubmitHandler,
  withNoLinebreakHandler,
  removeLineBreaksFromPaste,
  importEmbedModule,
  pasteImageAsBlockEmbed,
} from "./quillUtils";
import Tooltip from "./Tooltip";
import Spinner from "./Spinner";
import CustomNodesStyle from "./custom-nodes/CustomNodesStyle";

import "quill/dist/quill.bubble.css";
import "react-tenor/dist/styles.css";

const logging = require("debug")("bobapost:editor");
const loggingVerbose = require("debug")("bobapost:editor:verbose");
// @ts-ignore
import SpoilersIcon from "./img/spoilers.svg";
// logging.enabled = true;
// loggingVerbose.enabled = true;

// Only import Quill if there is a "window".
// This allows the editor to be imported even in a SSR environment.
// But also, let's add the type declaration regardless so TS won't
// complain.
// (This won't work without typescript 3.8.
// See: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#-type-only-imports-and-export
// And so we wait...)
// Also follow: https://github.com/zeit/next.js/issues/11196
//import type Quill from "quill";
import Quill from "quill";

let QuillModule: typeof Quill;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;

  const MagicUrl = require("quill-magic-url");
  QuillModule.register("modules/magicUrl", MagicUrl.default);
  const InlineSpoilers = require("./custom-nodes/InlineSpoilers");
  QuillModule.register("formats/inline-spoilers", InlineSpoilers.default);
  const icons = QuillModule.import("ui/icons");
  icons["inline-spoilers"] = renderToStaticMarkup(<SpoilersIcon />);
  logging(icons["inline-spoilers"]);
}

class Editor extends Component<Props> {
  state = {
    // QuillJS "empty state" still has one character.
    charactersTyped: 1,
    showTooltip: false,
    loaded: false,
    tooltipPostion: {
      top: 0,
      right: 0,
    },
  };

  editor: Quill = null as any;
  editorContainer = createRef<HTMLDivElement>();
  tooltip = createRef<HTMLDivElement>();
  toolbarContainer = createRef<HTMLDivElement>();

  skipTooltipUpdates = false;

  // Array of event handlers. Event handlers should be added here so
  // they can be unlinked when the component unmounts.
  eventHandlers: Array<{
    type: "text-change" | "selection-change" | "editor-change";
    handler: any;
  }> = [];
  removeLineBreaksHandler = null as any;
  imagePasteHandler = null as any;

  // Adds handler that checks how many characters have been typed
  // and updates parents when editor is empty.
  addCharactersTypedHandler() {
    const typingHandler = this.editor.on("text-change" as const, (delta) => {
      const currentCharacters = this.editor.getLength();
      const stateCharacters = this.state.charactersTyped;
      logging(
        `Text changed: ${currentCharacters}(current) ${stateCharacters}(previous)`
      );
      this.setState({ charactersTyped: currentCharacters }, () => {
        // We're only updating if the number of characters effectively changed
        // as it's possible for "text formatting" changes to also trigger
        // this callback and we don't want to continuously do so.
        if (this.props.onIsEmptyChange) {
          if (stateCharacters == 1 && currentCharacters > 1) {
            loggingVerbose("Marking not empty");
            this.props.onIsEmptyChange(false);
          } else if (stateCharacters > 1 && currentCharacters == 1) {
            loggingVerbose("Marking empty");
            this.props.onIsEmptyChange(true);
          }
        }
        if (this.props.onCharactersChange) {
          if (stateCharacters != currentCharacters) {
            loggingVerbose("Updating character count");
            this.props.onCharactersChange(currentCharacters);
          }
        }
      });
    });

    this.eventHandlers.push({
      type: "text-change" as const,
      handler: typingHandler,
    });
  }

  addTextChangeHandler() {
    const changeHandler = this.editor.on(
      "text-change" as const,
      (diff, old, source) => {
        loggingVerbose(`Text change from ${source}!`);
        loggingVerbose(this.editor.getContents());
        this.props.onTextChange(this.editor.getContents());
      }
    );

    this.eventHandlers.push({
      type: "text-change" as const,
      handler: changeHandler,
    });
  }

  // Adds handler that detects when the cursor is moved to a new line and
  // shows a tooltip.
  addEmptyLineTooltipHandler() {
    const newLineHandler = this.editor.on(
      "editor-change",
      (eventName: string, ...args: any) => {
        if (eventName === "selection-change") {
          if (!this.props.editable) {
            return;
          }
          const bounds = detectNewLine(this.editor);
          this.maybeShowEmptyLineTooltip(bounds);
          this.props.onTextChange(this.editor.getContents());
        }
      }
    );
    this.eventHandlers.push({
      type: "editor-change" as const,
      handler: newLineHandler,
    });
  }

  addCustomEmbeds() {
    const embedsLoadedCallback = () => {
      this.skipTooltipUpdates = false;
      const bounds = detectNewLine(this.editor);
      logging(`Embeds callback activated! New line bounds:`);
      logging(bounds);
      this.maybeShowEmptyLineTooltip(bounds);
      if (this.props.editable) {
        this.props.onTextChange(this.editor.getContents());
      }
      if (this.props.onEmbedLoaded) {
        this.props.onEmbedLoaded();
      }
    };

    const embedCloseCallback = (root: HTMLImageElement) => {
      logging(`deleting embed`);
      if (this.props.editable) {
        QuillModule.find(root, true)?.remove();
        this.props.onTextChange(this.editor.getContents());
        this.skipTooltipUpdates = false;
        const bounds = detectNewLine(this.editor);
        this.maybeShowEmptyLineTooltip(bounds);
      }
    };

    // TODO: context not existing has probably something to do with
    // nodes types missing
    require
      //@ts-ignore
      .context("./custom-nodes/", true, /(Image|Embed)$/)
      .keys()
      .map((path: string) => path.substring(2))
      .forEach((moduleName: string) => {
        importEmbedModule(moduleName, {
          onLoadCallback: embedsLoadedCallback,
          onRemoveRequestCallback: embedCloseCallback,
        });
      });
  }

  addRemoveLinebreaksOnPasteHandler() {
    this.removeLineBreaksHandler = this.editorContainer.current?.addEventListener(
      "paste",
      removeLineBreaksFromPaste as any,
      true
    );
  }

  addImagesPasteHandler() {
    this.editorContainer.current?.addEventListener(
      "paste",
      (e) => {
        pasteImageAsBlockEmbed(e, (img) => {
          this.addEmbed("block-image", img);
        });
      },
      true
    );
  }

  addEmbed(type: string, embed: any) {
    this.editor.focus();
    this.setState({ showTooltip: false });
    this.skipTooltipUpdates = true;
    const range = this.editor.getSelection(true);
    // TODO: remove empty line before inserting image?
    this.editor.insertEmbed(range.index, type, embed, "user");
    let nextRange = range.index + 1;
    while (
      typeof this.editor.getContents(nextRange, 1).ops[0].insert != "string"
    ) {
      nextRange++;
    }
    this.editor.setSelection(nextRange as any, "silent");
    // Request animation frame makes it work with gifs too
    requestAnimationFrame(() => this.editor.focus());
  }

  maybeShowEmptyLineTooltip(bounds: { top: number; right: number } | null) {
    if (this.skipTooltipUpdates) {
      return;
    }
    if (bounds == null) {
      this.setState({ showTooltip: false });
      return;
    }
    logging("Showing tooltip");
    this.setState({
      showTooltip: true,
      tooltipPostion: { top: bounds.top, right: bounds.right },
    });
  }

  shouldComponentUpdate(newProps: Props, newState: any) {
    loggingVerbose("New State:");
    loggingVerbose(newState);
    loggingVerbose("Should I update?");
    let update = false;
    update = update || newProps.editable != this.props.editable;
    update = update || newState.showTooltip != this.state.showTooltip;
    update = update || newState.tooltipPostion != this.state.tooltipPostion;
    update = update || newState.loaded != this.state.loaded;
    update = update || newProps.focus != this.props.focus;
    loggingVerbose(update ? "...yes." : "...no.");
    return update;
  }

  componentDidUpdate(prevProps: Props) {
    this.editor.enable(this.props.editable);
    if (!this.props.editable) {
      this.setState({ showTooltip: false });
    }

    if (this.props.focus && !prevProps.focus) {
      this.editor.focus();
    }
  }

  componentDidMount() {
    this.addCustomEmbeds();
    logging("Installing Quill Editor");
    const quillConfig = {
      modules: {
        toolbar: {
          container: this.toolbarContainer.current,
        },
        clipboard: {
          matchVisual: false,
        },
        magicUrl: {
          urlRegularExpression: /(https?:\/\/[\S]+)|(www\.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/,
        },
        keyboard: {
          bindings: {},
        },
      },
      theme: "bubble",
    };

    withKeyboardSubmitHandler(quillConfig.modules.keyboard, () => {
      logging("submitting via keyboard...");
      if (this.props.editable) {
        this.props.onTextChange(this.editor.getContents());
        this.props.onSubmit();
      }
    });

    if (this.props.singleLine) {
      logging("adding no linebreak handler...");
      withNoLinebreakHandler(quillConfig.modules.keyboard);
      this.addRemoveLinebreaksOnPasteHandler();
    }

    this.editor = new QuillModule(
      this.editorContainer.current as any,
      quillConfig
    );
    this.props.onEditorCreated?.(this.editor);

    // Add handlers
    this.addCharactersTypedHandler();
    this.addEmptyLineTooltipHandler();
    this.addTextChangeHandler();
    this.addImagesPasteHandler();

    // Set initial state
    this.editor.enable(this.props.editable);
    loggingVerbose(this.props.initialText);
    if (this.props.initialText) {
      this.editor.setContents(this.props.initialText);
    }

    if (this.props.focus) {
      this.editor.focus();
    }

    // Remove unwanted formatting on paste
    // TODO: check if same mechanism can be used to simplify code
    // in other parts of this codebase.
    this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      delta.forEach((e: any) => {
        if (e.attributes) {
          e.attributes.color = undefined;
          e.attributes.background = undefined;
        }
      });
      return delta;
    });

    // Initialize characters counts (if handlers attached)
    this.props.onIsEmptyChange &&
      this.props.onIsEmptyChange(this.editor.getLength() == 1);
    this.props.onCharactersChange &&
      this.props.onCharactersChange(this.editor.getLength());
    this.setState({ loaded: true });
    if (logging.enabled) {
      logging("Adding editor to global namespace.");
      // Save this editor for easy debug access.
      window["editor"] = this.editor;
    }
  }

  componentWillUnmount() {
    logging("Unmounting editor");
    logging("Unmounted editor content:");
    logging(this.editor.getContents());
    this.eventHandlers.forEach((handler) => {
      logging("Removing handler", handler);
      this.editor.off(handler.type as any, handler.handler);
    });

    if (this.removeLineBreaksHandler) {
      this.editorContainer.current?.removeEventListener(
        "paste",
        this.removeLineBreaksHandler
      );
    }
    if (this.imagePasteHandler) {
      this.editorContainer.current?.removeEventListener(
        "paste",
        this.imagePasteHandler
      );
    }
  }

  render() {
    return (
      <>
        <div
          className={classNames("editor", {
            loaded: this.state.loaded,
            "view-only": !this.props.editable,
          })}
        >
          <div className="spinner">
            <Spinner />
          </div>
          {/*This must always be mounted or it will trigger error during QuillJS's teardown.*/}
          <Toolbar ref={this.toolbarContainer} loaded={this.state.loaded} />
          {this.props.editable && (
            <Tooltip
              top={this.state.tooltipPostion.top}
              right={this.state.tooltipPostion.right}
              onInsertEmbed={({ type, embed }) => {
                this.addEmbed(type, embed);
              }}
              show={this.state.showTooltip && this.props.showTooltip != false}
              preventUpdate={(shouldPrevent) => {
                this.skipTooltipUpdates = shouldPrevent;
              }}
            />
          )}
          {/* Never add dynamic classes to this. If React re-renders it, then Quill fucks up.*/}
          <div className="editor-quill" ref={this.editorContainer}></div>
        </div>

        <style jsx>{`
          .editor,
          .editor-quill,
          .editor-quill,
          .editor :global(.ql-editor) {
            min-height: inherit;
          }
          .editor {
            position: relative;
            height: 100%;
          }
          .editor-quill {
            flex-grow: 1;
            font-size: medium;
          }
          .loaded .spinner {
            display: none;
          }
          .spinner {
            text-align: center;
          }
          .editor.view-only .editor-quill :global(.ql-editor) > :global(*) {
            cursor: auto !important;
          }
          .editor :global(.ql-editor) {
            overflow: visible;
            height: 100%;
            padding: 0;
          }
          .editor-quill :global(.ql-tooltip) {
            z-index: 5;
          }
          .editor :global(.ql-editor) :global(p) {
            word-break: break-word !important;
          }
          .editor :global(.ql-container) :global(a) {
            white-space: normal !important;
            word-break: break-word !important;
          }
        `}</style>
        {/* Add global styles for types*/}
        <CustomNodesStyle />
      </>
    );
  }
}

const Toolbar = forwardRef<HTMLDivElement, { loaded: boolean }>(
  ({ loaded }, ref) => {
    return (
      <>
        <div
          className={classNames("toolbar", "ql-toolbar", { loaded })}
          ref={ref}
        >
          <span className="ql-formats">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
            <button className="ql-strike"></button>
            <button className="ql-link"></button>
            <button className="ql-inline-spoilers"></button>
          </span>
          <span className="ql-formats">
            <select className="ql-header">
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="">Normal</option>
            </select>
          </span>
        </div>
        <style jsx>{`
          .toolbar {
            display: none;
          }
          .toolbar.loaded {
            display: block;
          }
        `}</style>
      </>
    );
  }
);

interface Props {
  editable: boolean;
  focus: boolean;
  initialText: any;
  // Note: this prop cannot be changed after initialization.
  singleLine?: boolean;
  showTooltip?: boolean;
  onTextChange: (_: any) => void;
  onIsEmptyChange?: (empty: boolean) => void;
  onCharactersChange?: (_: number) => void;
  onSubmit: () => void;
  onEditorCreated?: (editor: Quill) => void;
  // Called when any embed has finished loading and has assumed the
  // final width and height. Might trigger multiple times if multiple
  // embeds are present.
  // TODO: allow knowing when everything is done loading.
  onEmbedLoaded?: () => void;
}

export default Editor;
