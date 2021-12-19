import "quill/dist/quill.bubble.css";
import "react-tenor/dist/styles.css";

import React, { Component, createRef } from "react";
import { attachEventListeners, getSsrConverter } from "./ssrUtils";
import { defaultConfig, singleLineConfig } from "./tooltipConfig";
import {
  detectNewLine,
  importEmbedModule,
  isEmptyDelta,
  pasteImageAsBlockEmbed,
  removeBuggedEmptyClasses,
  removeLineBreaksFromPaste,
  withBlockquotesKeyboardBehavior,
  withLinkShortcut,
  withNoLinebreakHandler,
} from "./quillUtils";

import type { Delta } from "quill";
// Only import Quill if there is a "window".
// This allows the editor to be imported even in a SSR environment.
import type Quill from "quill";
import Spinner from "./Spinner";
import { Toolbar } from "./Toolbar";
import Tooltip from "./Tooltip";
import classNames from "classnames";
import editorStyle from "./css/Editor.module.css";
import { globalStyles } from "./custom-nodes/css/global";

const logging = require("debug")("bobapost:editor");
const loggingVerbose = require("debug")("bobapost:editor:verbose");
// logging.enabled = true;
// loggingVerbose.enabled = true;

let QuillModule: typeof Quill;
let CustomNodes = {};
// window = undefined;
// document = undefined;
if (typeof window !== "undefined") {
  QuillModule = require("quill") as typeof Quill;
  CustomNodes = require("./custom-nodes");
}

export interface EditorContextProps {
  cache?: {
    set: (url: string, node: HTMLElement) => void;
    has: (url: string) => boolean;
    get: (url: string) => HTMLElement | undefined;
    clear: () => void;
  };
  fetchers?: {
    getOEmbedFromUrl: (url: string) => any;
  };
}
export const EditorContext = React.createContext<EditorContextProps | null>(
  null
);

class Editor extends Component<EditorProps> {
  state = {
    // QuillJS "empty state" still has one character.
    charactersTyped: 1,
    empty: true,
    showTooltip: false,
    loaded: false,
    hasImage: false,
    tooltipPostion: {
      top: 0,
      right: 0,
    },
  };

  static contextType = EditorContext;

  editor: Quill = null as any;
  editorContainer = createRef<HTMLDivElement>();
  tooltip = createRef<HTMLDivElement>();
  toolbarContainer = createRef<HTMLDivElement>();
  ssrRef = createRef<HTMLDivElement>();

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
      const stateEmpty = this.state.empty;
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
          const currentlyEmpty = isEmptyDelta(this.editor.getContents());
          const onIsEmptyChange = this.props.onIsEmptyChange;
          if (stateEmpty != currentlyEmpty) {
            loggingVerbose(`Marking${currentlyEmpty ? "" : "not"} empty`);
            this.setState({ empty: currentlyEmpty }, () => {
              onIsEmptyChange(currentlyEmpty);
            });
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
        this.setState({
          ...this.state,
          // TODO: this should be changed with the attribute exported by the
          // BlockImage module.
          hasImage: !!this.editor
            .getContents()
            .ops?.find((op: any) => op.insert?.hasOwnProperty("block-image")),
        });
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
    this.props.onIsEmptyChange?.(isEmptyDelta(this.editor.getContents()));
    this.props.onCharactersChange?.(this.editor.getLength());
  }

  onEmbedChange(changes?: { isEmbedLoad?: boolean }) {
    if (this.props.editable) {
      this.skipTooltipUpdates = false;
      const bounds = detectNewLine(this.editor);
      logging(`Embeds callback activated! New line bounds:`);
      logging(bounds);
      this.maybeShowEmptyLineTooltip(bounds);
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
    // TODO: maybe things will change if using arrow functions for methods?
    const embedsLoadedCallback = () => {
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

    Object.keys(CustomNodes).forEach((key) => {
      importEmbedModule(
        key,
        {
          onLoadCallback: embedsLoadedCallback,
          onRemoveRequestCallback: embedCloseCallback,
        },
        this.context?.cache
      );
    });

    if (this.context?.fetchers?.getOEmbedFromUrl) {
      const OEmbed = require("./custom-nodes/OEmbedBase");
      OEmbed.default.getOEmbedFromUrl = this.context.fetchers?.getOEmbedFromUrl;
    }
  }

  addRemoveLinebreaksOnPasteHandler() {
    this.removeLineBreaksHandler =
      this.editorContainer.current?.addEventListener(
        "paste",
        removeLineBreaksFromPaste as any,
        true
      );
  }

  addImagesPasteHandler() {
    this.imagePasteHandler = (e: ClipboardEvent) => {
      pasteImageAsBlockEmbed(e, (img) => {
        if (!this.props.singleLine || !this.state.hasImage) {
          this.addEmbed("block-image", img);
        }
      });
    };
    this.editorContainer.current?.addEventListener(
      "paste",
      this.imagePasteHandler,
      true
    );
  }

  focus() {
    this.editor?.focus();
  }

  getEditorContents() {
    return this.editor?.getContents()?.ops as any;
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
      typeof this.editor.getContents(nextRange, 1).ops?.[0].insert != "string"
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

  componentDidUpdate(previousProps: EditorProps, previousState: any) {
    // @ts-ignore
    if (this.editor.isEnabled() != !!this.props.editable) {
      this.editor.enable(!!this.props.editable);
    }
    if (
      this.state.showTooltip &&
      previousProps.editable != this.props.editable
    ) {
      this.setState({ showTooltip: false });
    }
  }

  componentDidMount() {
    if (this.isServer()) {
      if (typeof "window" !== "undefined") {
        // We're rendering in SSR mode, but we're on the client.
        attachEventListeners(this.ssrRef);
      }
      return;
    }
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
          urlRegularExpression:
            /(https?:\/\/[\S]+)|(www\.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/,
        },
        keyboard: {
          bindings: {},
        },
      },
      theme: "bubble",
    };

    if (this.props.singleLine) {
      logging("adding no linebreak handler...");
      withNoLinebreakHandler(quillConfig.modules.keyboard);
      this.addRemoveLinebreaksOnPasteHandler();
    }
    withBlockquotesKeyboardBehavior(quillConfig.modules.keyboard);
    withLinkShortcut(quillConfig.modules.keyboard);

    this.maybeRegisterModules();
    this.editor = new QuillModule(
      this.editorContainer.current as any,
      quillConfig
    );
    // Change the text in the tooltip textbox
    // @ts-ignore
    this.editor.theme.tooltip.textbox.dataset.link = "link a link!";
    this.props.onEditorCreated?.(this.editor);
    this.ssrRef?.current?.parentElement?.removeChild(this.ssrRef.current);

    // Add handlers
    this.addCharactersTypedHandler();
    this.addEmptyLineTooltipHandler();
    this.addTextChangeHandler();
    this.addImagesPasteHandler();

    // Set initial state
    this.editor.enable(!!this.props.editable);
    loggingVerbose(this.props.initialText);
    if (this.props.initialText) {
      this.editor.setContents(this.props.initialText);
    }

    if (this.props.handler) {
      // Note: Typescript marks current as a read-only property, which it isn't.
      // @ts-ignore
      this.props.handler.current = {
        focus: this.focus.bind(this),
        getEditorContents: this.getEditorContents.bind(this),
      };
    }
    if (logging.enabled) {
      logging("Adding editor to global namespace.");
      // Save this editor for easy debug access.
      window["editor"] = this.editor;
    }

    if (!this.isServer) {
      removeBuggedEmptyClasses(this.editorContainer.current);
    }

    this.setState({
      loaded: true,
      empty: !this.props.initialText || isEmptyDelta(this.props.initialText),
    });
    this.maybeInitializeEditableEditor();
  }

  maybeRegisterModules() {
    // @ts-ignore
    if (!QuillModule.imports["modules/magicUrl"]) {
      const MagicUrl = require("quill-magic-url");
      QuillModule.register("modules/magicUrl", MagicUrl.default, true);
    }
    // @ts-ignore
    if (!QuillModule.imports["formats/inline-spoilers"]) {
      const InlineSpoilers = require("./custom-nodes/InlineSpoilers");
      QuillModule.register(
        "formats/inline-spoilers",
        InlineSpoilers.default,
        true
      );
    }
    if ((QuillModule.import("blots/break")?.name != "CustomBreak", true)) {
      const CustomBreak = require("./custom-nodes/CustomBreak");
      QuillModule.register("blots/break", CustomBreak.default, true);
    }
    if (QuillModule.import("blots/text")?.name != "CustomText") {
      const CustomText = require("./custom-nodes/CustomText");
      QuillModule.register("blots/text", CustomText.default, true);
    }
    if (QuillModule.import("formats/image")?.name != "CustomImage") {
      const CustomImage = require("./custom-nodes/CustomImage");
      QuillModule.register("formats/image", CustomImage.default, true);
    }
  }

  componentWillUnmount() {
    if (this.isServer()) {
      // We do this so we can test how this will work with server rendering.
      return;
    }
    logging("Unmounting editor");
    logging("Unmounted editor content:");
    logging(this.editor?.getContents());
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

  isServer() {
    return this.props.forceSSR || typeof window == "undefined";
  }

  render() {
    const ssrText =
      // @ts-ignore
      this.isServer() && getSsrConverter().convert(this.props.initialText);
    const editorClasses = classNames(editorStyle.editor, {
      [editorStyle.loaded]: this.state.loaded,
      [editorStyle["single-line"]]: this.props.singleLine,
      [editorStyle["has-image"]]: this.state.hasImage,
      [editorStyle["view-only"]]: !this.props.editable,
    });

    console.log(editorStyle);
    return (
      <>
        {ssrText && (
          <div className={editorClasses}>
            <div
              className="editor-quill ql-container ql-bubble "
              ref={this.ssrRef}
            >
              <div
                className="ql-editor"
                dangerouslySetInnerHTML={{
                  __html: ssrText,
                }}
              ></div>
            </div>
          </div>
        )}
        {!ssrText && (
          <div className={editorClasses}>
            <div className={editorStyle.spinner}>
              <Spinner />
            </div>
            {/*This must always be mounted or it will trigger error during QuillJS's teardown.*/}
            {!ssrText && (
              <Toolbar
                ref={this.toolbarContainer}
                loaded={this.state.loaded}
                singleLine={!!this.props.singleLine}
              />
            )}
            {this.props.editable &&
              // When it's single line, there can only be ONE image
              (!this.props.singleLine || !this.state.hasImage) && (
                <Tooltip
                  config={
                    this.props.singleLine ? singleLineConfig : defaultConfig
                  }
                  top={this.state.tooltipPostion.top}
                  right={this.state.tooltipPostion.right}
                  onInsertEmbed={({ type, embed }) => {
                    this.addEmbed(type, embed);
                  }}
                  onSetFormat={(format: string) => {
                    this.setFormat(format);
                  }}
                  show={
                    this.state.showTooltip && this.props.showTooltip != false
                  }
                  preventUpdate={(shouldPrevent) => {
                    this.skipTooltipUpdates = shouldPrevent;
                  }}
                />
              )}
            {/* Never add dynamic classes to this. If React re-renders it, then Quill fucks up.*/}
            <div
              className="editor-quill"
              ref={this.editorContainer}
              role="textbox"
            ></div>
          </div>
        )}
        {/* Add global styles for types*/}
        <style jsx>{globalStyles}</style>
      </>
    );
  }
}

export interface EditorHandler {
  // Focus the embed.
  focus: () => void;
  // TODO: remove this. I forget why this is here, but this should *not* be used.
  // Likely it was an attempt to do some performance optimization, but this is not
  // the right way of doing things and the optimization failed anyway.
  getEditorContents(): () => Delta;
}

interface BaseProps {
  // A QuillJS delta. Changes to initial text won't be honored after first
  // load.
  initialText?: Delta;
  // If singleLine is true, the formatting options allowed are limited,
  // and new line characters are ignored.
  // Note: this prop cannot be changed after initialization.
  singleLine?: boolean;
  // Enables tooltip on empty line.
  showTooltip?: boolean;
  // Returns a ref to the EditorHandler object. While this might seem like a bad
  // React practice, it's actually suggested for
  handler?: React.RefObject<EditorHandler>;
  // Called when any embed has finished loading and has assumed the
  // final width and height. Might trigger multiple times if multiple
  // embeds are present.
  // TODO: allow subscribing to a callback for when every embed is done loading.
  onEmbedLoaded?: () => void;
  // A callback for when the editor is created, returning a reference to
  // the undelying Quill editor. Shouldn't be used unless in testing emergencies.
  // TODO: remove this.
  onEditorCreated?: (editor: Quill) => void;
  // Makes the editor content renderable in a server-side environment. While we do our best
  // to make things work, this is highly experimental for now.
  forceSSR?: boolean;
}

export interface EditableEditorProps extends BaseProps {
  editable: true;
  // Whether to focus the editor when it's first mounted.
  focusOnMount?: boolean;
  // Every time the text is changed, this method will be called with
  // the new QuillJS delta.
  onTextChange: (newText: any) => void;
  // Called every time the "empty" sta tus of the editor changes (and the first time
  // the editor is mounted).
  // This is not the same as counting the characters on the "text" parameter in
  // onTextChange, because that contains additional QuillJS delta "noise". In addition,
  // this also checks for "fundamentally empty" deltas, e.g. those only containing spaces
  // or line breaks.
  onIsEmptyChange?: (empty: boolean) => void;
  // Called every time the number of type characters changes.
  onCharactersChange?: (_: number) => void;
}

export interface NonEditableEditorProps extends BaseProps {
  editable?: false;
}

export type EditorProps = EditableEditorProps | NonEditableEditorProps;

export default Editor;
