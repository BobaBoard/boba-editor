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
  withBlockquotesKeyboardBehavior,
} from "./quillUtils";
import Tooltip from "./Tooltip";
import Spinner from "./Spinner";
import CustomNodesStyle from "./custom-nodes/CustomNodesStyle";
import { defaultConfig } from './defaultConfig'

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
}

class Editor extends Component<EditorProps> {
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
        if (!this.props.editable) {
          return;
        }
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
        if (!this.props.editable) {
          return;
        }
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

  maybeInitializeEditableEditor() {
    if (!this.props.editable) {
      return;
    }

    if (this.props.focusOnMount) {
      this.focus();
    }
    // Remove unwanted formatting on paste
    // TODO: check if same mechanism can be used to simplify code
    // in other parts of this codebase.
    this.editor.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      delta.forEach((e: any) => {
        if (e.attributes) {
          e.attributes.color = undefined;
          e.attributes.background = undefined;
          e.attributes["code-block"] = false;
        }
      });
      return delta;
    });

    // Initialize characters counts (if handlers attached)
    this.props.onIsEmptyChange?.(this.editor.getLength() == 1);
    this.props.onCharactersChange?.(this.editor.getLength());
  }

  onEmbedChange(changes?: { isEmbedLoad?: boolean }) {
    if (this.props.editable) {
      this.props.onTextChange(this.editor.getContents());
    }
    if (changes?.isEmbedLoad) {
      this.props.onEmbedLoaded?.();
    }
  }

  addCustomEmbeds() {
    // TODO: note these are apparently called always from the context of the latest
    // Editor component to be initialized in a page. As such, using methods that refer to
    // props is undesiderable (but using this to refer to methods that then refer to props is fine).
    // At least, this is my best guess as to what's happening.
    // I couldn't figure out how to fix this without moving all the methods outside.
    const embedsLoadedCallback = () => {
      this.skipTooltipUpdates = false;
      const bounds = detectNewLine(this.editor);
      logging(`Embeds callback activated! New line bounds:`);
      logging(bounds);
      this.maybeShowEmptyLineTooltip(bounds);
      this.onEmbedChange({ isEmbedLoad: true });
    };

    const embedCloseCallback = (root: HTMLImageElement) => {
      logging(`deleting embed`);
      QuillModule.find(root, true)?.remove();
      this.skipTooltipUpdates = false;
      const bounds = detectNewLine(this.editor);
      this.maybeShowEmptyLineTooltip(bounds);
      this.onEmbedChange();
    };

    // TODO: context not existing (for typescript) has probably something to do with
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

  focus() {
    this.editor?.focus();
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

  setFormat(format: string) {
    this.editor.focus();
    // const range = this.editor.getSelection(true);
    //debugger;
    this.editor.format(format, true);
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

  shouldComponentUpdate(newProps: EditorProps, newState: any) {
    loggingVerbose("New State:");
    loggingVerbose(newState);
    loggingVerbose("Should I update?");
    let update = false;
    update = update || newProps.editable != this.props.editable;
    update = update || newState.showTooltip != this.state.showTooltip;
    update = update || newState.tooltipPostion != this.state.tooltipPostion;
    update = update || newState.loaded != this.state.loaded;
    loggingVerbose(update ? "...yes." : "...no.");
    return update;
  }

  componentDidUpdate() {
    this.editor.enable(this.props.editable);
    if (!this.props.editable) {
      this.setState({ showTooltip: false });
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
    withBlockquotesKeyboardBehavior(quillConfig.modules.keyboard);

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

    if (this.props.handler) {
      // Note: Typescript marks current as a read-only property, which it isn't.
      // @ts-ignore
      this.props.handler.current = {
        focus: this.focus.bind(this),
      };
    }
    if (logging.enabled) {
      logging("Adding editor to global namespace.");
      // Save this editor for easy debug access.
      window["editor"] = this.editor;
    }

    this.setState({ loaded: true });
    this.maybeInitializeEditableEditor();
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
              config={defaultConfig}
              top={this.state.tooltipPostion.top}
              right={this.state.tooltipPostion.right}
              onInsertEmbed={({ type, embed }) => {
                this.addEmbed(type, embed);
              }}
              onSetFormat={(format: string) => {
                this.setFormat(format);
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
            font-family: "Inter", sans-serif;
            color: var(--text-color, inherit);
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
            position: absolute;
            z-index: 5;
            right: 50%;
            transform: translateX(50%);
          }
          .editor.view-only .editor-quill :global(.ql-editor) > :global(*) {
            cursor: auto !important;
          }
          .editor :global(.ql-editor) {
            overflow: visible;
            height: 100%;
            padding: 0;
          }
          :global(.ql-container.ql-bubble:not(.ql-disabled) a::before),
          :global(.ql-container.ql-bubble:not(.ql-disabled) a::after) {
            word-break: keep-all;
            max-width: min(300px, 60vw);
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
            color: var(--a-color, rgb(249, 102, 128));
            cursor: pointer;
          }
          .editor :global(.ql-container) :global(a:visited) {
            color: var(--a-visited-color, #eb0f37);
          }
          .editor :global(:not(blockquote)) + :global(blockquote) {
            background-color: red;
            margin-top: 5px;
          }
          .editor :global(blockquote) + :global(:not(blockquote)) {
            margin-top: 5px;
            background-color: red;
          }
          .editor :global(blockquote) {
            margin-bottom: 0px;
            margin-top: 0px;
          }
          .editor :global(.ql-editor) :global(h1),
          .editor :global(.ql-editor) :global(h2),
          .editor :global(.ql-editor) :global(h3) {
            font-weight: normal;
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
            <button className="ql-list" value="bullet"></button>
            <button className="ql-list" value="ordered"></button>
            <button className="ql-inline-spoilers"></button>
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
        <style jsx>{`
          .toolbar {
            display: none;
          }
          .toolbar.loaded {
            display: block;
            text-align: center;
          }
        `}</style>
      </>
    );
  }
);

export interface EditorHandler {
  focus: () => void;
}

interface BaseProps {
  // A QuillJS delta. Changes won't be reflected here.
  initialText: any;
  // If singleLine is true, the formatting options allowed are limited,
  // and new line characters are ignored.
  // Note: this prop cannot be changed after initialization.
  singleLine?: boolean;
  // Enables tooltip on empty line.
  showTooltip?: boolean;
  handler?: React.RefObject<EditorHandler>;
  // Called when any embed has finished loading and has assumed the
  // final width and height. Might trigger multiple times if multiple
  // embeds are present.
  // TODO: allow knowing when everything is every embed is done loading.
  onEmbedLoaded?: () => void;
  // A callback for when the editor is created, returning a reference to
  // the undelying Quill editor. Shouldn't be used unless in testing emergencies.
  // TODO: remove this.
  onEditorCreated?: (editor: Quill) => void;
}

interface EditableProps extends BaseProps {
  editable: true;
  // Whether to focus the editor when it's first mounted.
  focusOnMount?: boolean;
  // Every time the text is changed, this method will be called with
  // the new QuillJS delta.
  onTextChange: (newText: any) => void;
  // Called every time the "empty" status of the editor changes.
  // This is not the same as counting the characters on the "text" parameter in
  // onTextChange, because that contains additional QuillJS
  onIsEmptyChange?: (empty: boolean) => void;
  onCharactersChange?: (_: number) => void;
  onSubmit: () => void;
}

interface NonEditableProps extends BaseProps {
  editable?: false;
}

export type EditorProps = EditableProps | NonEditableProps;

export default Editor;
