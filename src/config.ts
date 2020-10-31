interface EmbedBase {
  blotName: string;
}

export interface EmbedType {
  embedName: string;
  embedClass: EmbedBase;
  icon: any;
}

export interface TooltipConfig {
  enabledEmbeds: EmbedType[];
}
