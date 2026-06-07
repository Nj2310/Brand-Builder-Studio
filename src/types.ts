export interface Shot {
  medium: string;
  mediumTitle: string;
  mediumDescription: string;
  imagePrompt: string;
  aspectRatio: string;
  imageUrl: string;
  success: boolean;
  fallbackUsed?: boolean;
  errorMsg?: string;
}

export interface Campaign {
  id: string;
  timestamp: string;
  productDescription: string;
  campaignName: string;
  brandSlogan: string;
  consistencyAnchor: string;
  shots: Shot[];
  stylePreset: string;
}

export interface MediumOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultPromptOutline: string;
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
}
