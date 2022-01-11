interface EmbedBase {
  blotName: string;
}

export enum TooltipModule {
  IMAGE,
  GIF,
  CODEBLOCK,
  QUOTE,
}

export interface EmbedType {
  embedName: string;
  embedClass: EmbedBase;
  icon: any;
}

export interface EmbedValue {
  url: string;
  embedWidth?: string;
  embedHeight?: string;
}

export interface TweetEmbed extends EmbedValue {
  href: string;
  did: string;
  spoilers?: boolean;
  thread?: boolean;
}

export interface TooltipConfig {
  enabledEmbeds: EmbedType[];
  enabledModules: TooltipModule[];
}
