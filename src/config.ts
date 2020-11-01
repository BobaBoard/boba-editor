interface EmbedBase {
  blotName: string;
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

export interface TooltipConfig {
  enabledEmbeds: EmbedType[];
}
