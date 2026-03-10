export type FontType = 'Inter' | 'Playfair Display' | 'Roboto Mono' | 'Space Grotesk' | 'Caveat' | 'Merriweather';
export type TextAlign = 'left' | 'center' | 'right';
export type AspectRatio = '9:16' | '1:1' | '16:9';

export interface TextFormat {
  fontFamily: FontType;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  shadowIntensity: number;
}

export interface Template {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern' | 'photo';
  background: string; // hex, gradient css, pattern url, or photo url
  defaultPadding: number;
  defaultTextColor: string;
  mood: string;
}

export interface LayoutConfig {
  aspectRatio: AspectRatio;
  padding: number;
  showOverlay: boolean;
  overlayOpacity: number;
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
  textPosition: { x: number; y: number }; // relative 0-1 or absolute? Let's use absolute relative to canvas size, or just let Konva handle it.
  showWatermark: boolean;
}

export interface QuoteDraft {
  id: string;
  updatedAt: number;
  text: string;
  author: string;
  format: TextFormat;
  templateId: string;
  layout: LayoutConfig;
  customPhotoUrl?: string; // If template is 'photo' and user uploaded one
}
