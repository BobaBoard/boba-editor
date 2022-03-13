import { EditorContextProps } from "Editor";
import React from "react";
import { StoryContext } from "@storybook/react";
import { StoryFnReactReturnType } from "@storybook/react/dist/client/preview/types";

export const WITH_CACHE =
  (embedType: any) =>
  (Story: () => StoryFnReactReturnType, storyArgs: StoryContext) => {
    const cacheReference = React.useRef<EditorContextProps["cache"]>(new Map());
    const cacheStateDiv = React.useRef<HTMLDivElement>(null);
    const [_, refresh] = React.useState(0);
    storyArgs.args.embedsCache = cacheReference.current;
    const updateCacheStatus = () => {
      if (cacheStateDiv.current) {
        cacheStateDiv.current.innerText = cacheReference.current?.has(
          embedType.getHashForCache(storyArgs.args)
        )
          ? "Yes"
          : "No";
      }
    };

    React.useEffect(() => {
      setTimeout(() => {
        console.log("updating cache status");
        updateCacheStatus();
      }, 1000);
    });

    React.useEffect(() => {
      embedType.setOnLoadCallback(() => {
        updateCacheStatus();
      });

      return () => {
        embedType.setOnLoadCallback(() => {});
      };
    }, []);

    return (
      <>
        {Array.from(Array(_ + 1), (_, i) => (
          <Story key={i} />
        ))}
        <div style={{ position: "fixed", right: 0, top: 0 }}>
          <div style={{ backgroundColor: "aliceblue" }}>
            <div>
              Is in cache?{" "}
              <div ref={cacheStateDiv}>
                {cacheReference.current?.has(storyArgs.args.href)
                  ? "Yes"
                  : "No"}
              </div>
            </div>
            <button onClick={() => refresh((x) => x + 1)}>Add</button>
            <button onClick={() => console.log(storyArgs.args.embedsCache)}>
              Log Cache
            </button>
            <button
              onClick={() =>
                cacheReference.current?.clear() || updateCacheStatus()
              }
            >
              Clear Cache
            </button>
          </div>
        </div>
      </>
    );
  };
