import { EmbedValue, TweetEmbed } from "../../config";

import React from "react";

type TweetProps = string | EmbedValue | TweetEmbed;

const sanitize = (value: string) => {
  throw new Error("Unimplemented");
};

const loadTweet = (
  id: string,
  node: HTMLElement,
  setTweetState: React.Dispatch<React.SetStateAction<TweetState>>,
  attemptsRemaining = 5
) => {
  // @ts-ignore
  window?.twttr?.widgets
    ?.createTweet(id, node, {
      theme: "dark",
      width: 550,
      align: "center",
      conversation: node.dataset.thread === "true" ? undefined : "none",
    })
    .then((el: HTMLDivElement) => {
      // If there is more than one rendered tweet here, it means we're in a
      // "option change" situation. Remove the older.
      //   const renderedNode = node.querySelectorAll(".twitter-tweet");
      //   if (renderedNode.length > 1) {
      //     renderedNode[0].parentElement?.removeChild(renderedNode[0]);
      //   }
      //   node.dataset.rendered = "true";
      // TODO: readd error handling
      //   TweetEmbed.doneLoading(node);
      //   if (!el) {
      //     addErrorMessage(node, {
      //       message: "This tweet.... it dead.",
      //       url: TweetEmbed.value(node).url || "",
      //       width: TweetEmbed.value(node)["embedWidth"],
      //       height: TweetEmbed.value(node)["embedHeight"],
      //     });
      //     logging(`Ooops, there's no tweet there!`);
      //     return;
      //   }
      //   if (el.getBoundingClientRect().height == 0) {
      //     node.classList.add("ios-bug");
      //     const twitterImg = document.createElement("img");
      //     twitterImg.src = TwitterIcon;
      //     node.appendChild(twitterImg);
      //     addErrorMessage(node, {
      //       message: `You've been hit by... <br />
      //          You've been strucky by... <br />
      //          A smooth iOS bug.<br />
      //          (click to access tweet)`,
      //       url: TweetEmbed.value(node).url || "",
      //       width: TweetEmbed.value(node)["embedWidth"],
      //       height: TweetEmbed.value(node)["embedHeight"],
      //     });
      //     logging(`That damn iOS bug!`);
      //   } else {
      const embedSizes = el.getBoundingClientRect();
      setTweetState((state) => ({
        ...state,
        loading: false,
        width: `${embedSizes.width}`,
        height: `${embedSizes.height}`,
      }));
      //   node.dataset.embedWidth = `${embedSizes.width}`;
      //   node.dataset.embedHeight = `${embedSizes.height}`;

      console.log(embedSizes);
      //   if (TweetEmbed.onLoadCallback) {
      //     // Add some time to remove the loading class or the
      //     // calculation of the new tooltip position will be
      //     // weird
      //     // TODO: figure out why rather than hack it.
      //     setTimeout(() => TweetEmbed.onLoadCallback(el), 100);
      //     TweetEmbed.cache?.set(
      //       TweetEmbed.getHashForCache(TweetEmbed.value(node)),
      //       node
      //     );
      //   }
      return;
    })
    .catch((e: any) => {
      //   logging(`There was a serious error  tweet creation!`);
      //   logging(e);
      //   TweetEmbed.doneLoading(node);
      //   addErrorMessage(node, {
      //     message: `This tweet.... it bad.<br />(${e.message})`,
      //     url: TweetEmbed.value(node).url || "",
      //     width: TweetEmbed.value(node)["embedWidth"],
      //     height: TweetEmbed.value(node)["embedHeight"],
      //   });
    });
  // If the twitter library is not loaded yet, defer rendering
  // TODO: https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
  // @ts-ignore
  //   if (!window?.twttr?.widgets) {
  //     logging(`Twitter main library is not loaded.`);
  //     logging(`${attemptsRemaining} reload attempts remaining`);
  //     if (!attemptsRemaining) {
  //       logging(`We're out of attempts! Time to panic!`);
  //       TweetEmbed.doneLoading(node);
  //       addErrorMessage(node, {
  //         message: "The Twitter Embeds library... it dead.",
  //         url: TweetEmbed.value(node).url || "",
  //         width: TweetEmbed.value(node)["embedWidth"],
  //         height: TweetEmbed.value(node)["embedHeight"],
  //       });
  //       return;
  //     }
  //setTimeout(() => loadTweet(id, node, attemptsRemaining - 1), 50);
};

interface TweetState {
  loading: boolean;
  width: string | undefined;
  height: string | undefined;
  rendered: boolean;
  thread: boolean;
}

export default ({ value }: { value: TweetProps }) => {
  const url = new URL(typeof value == "string" ? sanitize(value) : value.url);
  const id = url.pathname.substr(url.pathname.lastIndexOf("/") + 1);
  const [currentValue, setCurrentValue] = React.useState<TweetState>({
    loading: true,
    width: value["embedWidth"],
    height: value["embedHeight"],
    rendered: false,
    thread: !!value["thread"],
  });
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    console.log(containerRef.current?.querySelector("iframe"));
    if (!containerRef.current || containerRef.current.querySelector("iframe")) {
      return;
    }
    console.log("loading tweet");
    loadTweet(id, containerRef.current, setCurrentValue);
  }, [containerRef]);

  return (
    <div
      ref={containerRef}
      contentEditable={false}
      data-id={id}
      data-url={url}
      data-embed-width={currentValue.width}
      data-embed-height={currentValue.height}
      data-rendered={currentValue.rendered}
      data-thread={currentValue.thread}
      style={{
        width: `${currentValue.width}px`,
        height: `${currentValue.height}px`,
      }}
    >
      {currentValue.loading && <div>"Loading..."</div>}
    </div>
  );
};
