import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { QuoteDraft, TextFormat, LayoutConfig, AspectRatio, FontType } from './types';
import { TEMPLATES } from './lib/templates';
import { saveDraft } from './lib/storage';

interface AppState {
  draftId: string;
  text: string;
  author: string;
  format: TextFormat;
  templateId: string;
  layout: LayoutConfig;
  customPhotoUrl?: string;
  
  setText: (t: string) => void;
  setAuthor: (a: string) => void;
  updateFormat: (updates: Partial<TextFormat>) => void;
  setTemplateId: (id: string) => void;
  updateLayout: (updates: Partial<LayoutConfig>) => void;
  setCustomPhotoUrl: (url: string) => void;
  loadDraft: (draft: QuoteDraft) => void;
  createNewDraft: () => void;
}

const defaultFormat: TextFormat = {
  fontFamily: 'Inter',
  fontSize: 48,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  align: 'center',
  lineHeight: 1.4,
  letterSpacing: 0,
  color: '#ffffff',
  shadowIntensity: 0,
};

const defaultLayout: LayoutConfig = {
  aspectRatio: '9:16',
  padding: 40,
  showOverlay: true,
  overlayOpacity: 0.3,
  showBorder: false,
  borderColor: '#ffffff',
  borderWidth: 2,
  textPosition: { x: 0.5, y: 0.5 }, // center
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [draftId, setDraftId] = useState<string>(uuidv4());
  const [text, setText] = useState('The only way to do great work is to love what you do.');
  const [author, setAuthor] = useState('Steve Jobs');
  const [format, setFormat] = useState<TextFormat>(defaultFormat);
  const [templateId, setTemplateId] = useState<string>('photo-nature');
  const [layout, setLayout] = useState<LayoutConfig>(defaultLayout);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | undefined>();

  // Auto-save draft
  useEffect(() => {
    const draft: QuoteDraft = {
      id: draftId,
      updatedAt: Date.now(),
      text,
      author,
      format,
      templateId,
      layout,
      customPhotoUrl,
    };
    saveDraft(draft).catch(console.error);
  }, [draftId, text, author, format, templateId, layout, customPhotoUrl]);

  const updateFormat = (updates: Partial<TextFormat>) => setFormat(prev => ({ ...prev, ...updates }));
  const updateLayout = (updates: Partial<LayoutConfig>) => setLayout(prev => ({ ...prev, ...updates }));

  const loadDraft = (draft: QuoteDraft) => {
    setDraftId(draft.id);
    setText(draft.text);
    setAuthor(draft.author);
    setFormat(draft.format);
    setTemplateId(draft.templateId);
    setLayout(draft.layout);
    setCustomPhotoUrl(draft.customPhotoUrl);
  };

  const createNewDraft = () => {
    setDraftId(uuidv4());
    setText('');
    setAuthor('');
    setFormat(defaultFormat);
    setTemplateId('solid-dark');
    setLayout(defaultLayout);
    setCustomPhotoUrl(undefined);
  };

  return (
    <AppContext.Provider value={{
      draftId, text, author, format, templateId, layout, customPhotoUrl,
      setText, setAuthor, updateFormat, setTemplateId, updateLayout, setCustomPhotoUrl, loadDraft, createNewDraft
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}
