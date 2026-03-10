import React, { useState } from 'react';
import { Type, Image as ImageIcon, Layout as LayoutIcon, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import { useAppStore } from '../store';
import { TEMPLATES } from '../lib/templates';
import { FontType, AspectRatio } from '../types';
import { cn } from '../lib/utils';

const FONTS: FontType[] = ['Inter', 'Playfair Display', 'Roboto Mono', 'Space Grotesk', 'Caveat', 'Merriweather'];
const RATIOS: AspectRatio[] = ['9:16', '1:1', '16:9'];

export default function EditorControls() {
  const [activeTab, setActiveTab] = useState<'text' | 'template' | 'layout'>('text');
  
  return (
    <div className="bg-white border-t border-zinc-200 flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        <TabButton active={activeTab === 'text'} onClick={() => setActiveTab('text')} icon={<Type size={18} />} label="Text" />
        <TabButton active={activeTab === 'template'} onClick={() => setActiveTab('template')} icon={<ImageIcon size={18} />} label="Template" />
        <TabButton active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} icon={<LayoutIcon size={18} />} label="Layout" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'text' && <TextControls />}
        {activeTab === 'template' && <TemplateControls />}
        {activeTab === 'layout' && <LayoutControls />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 py-3 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
        active ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-500 hover:text-zinc-700"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

import RichTextEditor from './RichTextEditor';

function TextControls() {
  const { text, author, format, setText, setAuthor, updateFormat } = useAppStore();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Quote</label>
        <RichTextEditor 
          html={text}
          onChange={setText}
          placeholder="Enter your quote..."
        />
        <div className="text-right text-xs text-zinc-400 mt-1">{text.replace(/<[^>]*>?/gm, '').length} chars</div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Author (Optional)</label>
        <input 
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full p-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
          placeholder="e.g. Steve Jobs"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-2">Font Family</label>
        <div className="flex flex-wrap gap-2">
          {FONTS.map(font => (
            <button
              key={font}
              onClick={() => updateFormat({ fontFamily: font })}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-colors",
                format.fontFamily === font ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
              )}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-2">Size</label>
          <input 
            type="range" min="24" max="120" 
            value={format.fontSize}
            onChange={(e) => updateFormat({ fontSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-2">Line Height</label>
          <input 
            type="range" min="1" max="2" step="0.1"
            value={format.lineHeight}
            onChange={(e) => updateFormat({ lineHeight: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-2">Letter Spacing</label>
          <input 
            type="range" min="-5" max="20" 
            value={format.letterSpacing}
            onChange={(e) => updateFormat({ letterSpacing: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-500 mb-2">Shadow Intensity</label>
          <input 
            type="range" min="0" max="100" 
            value={format.shadowIntensity}
            onChange={(e) => updateFormat({ shadowIntensity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-zinc-500">Text Color</label>
          <input 
            type="color" 
            value={format.color}
            onChange={(e) => updateFormat({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
        </div>
      </div>
    </div>
  );
}

function FormatBtn({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("p-2 rounded-md transition-colors", active ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700")}
    >
      {icon}
    </button>
  );
}

function TemplateControls() {
  const { templateId, setTemplateId, setCustomPhotoUrl } = useAppStore();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setTemplateId('photo-custom');
    }
  };

  // Group templates by mood
  const templatesByMood = TEMPLATES.reduce((acc, template) => {
    if (!acc[template.mood]) {
      acc[template.mood] = [];
    }
    acc[template.mood].push(template);
    return acc;
  }, {} as Record<string, typeof TEMPLATES>);

  return (
    <div className="space-y-8 pb-8">
      {Object.entries(templatesByMood).map(([mood, templates]) => (
        <div key={mood} className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{mood}</h3>
          <div className="grid grid-cols-3 gap-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setTemplateId(template.id)}
                className={cn(
                  "relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all",
                  templateId === template.id ? "border-zinc-900 scale-95 shadow-md" : "border-transparent hover:scale-95"
                )}
              >
                {template.type === 'solid' && <div className="w-full h-full" style={{ background: template.background }} />}
                {template.type === 'gradient' && <div className="w-full h-full" style={{ background: template.background }} />}
                {template.type === 'pattern' && <div className="w-full h-full" style={{ background: template.background }} />}
                {template.type === 'photo' && template.id !== 'photo-custom' && (
                  <img src={template.background} alt={template.name} className="w-full h-full object-cover" />
                )}
                {template.id === 'photo-custom' && (
                  <div className="w-full h-full bg-zinc-100 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors">
                    <ImageIcon size={24} />
                    <span className="text-[10px] mt-1 font-medium">Upload</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[10px] p-2 pt-4 text-center">
                  {template.name}
                </div>
              </button>
            ))}
          </div>

          {mood === 'Custom' && templateId === 'photo-custom' && (
            <div className="mt-2">
              <label className="block w-full py-3 px-4 border-2 border-dashed border-zinc-300 rounded-xl text-center cursor-pointer hover:bg-zinc-50 transition-colors">
                <span className="text-sm font-medium text-zinc-600">Choose Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LayoutControls() {
  const { layout, updateLayout } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-2">Aspect Ratio</label>
        <div className="flex gap-2">
          {RATIOS.map(ratio => (
            <button
              key={ratio}
              onClick={() => updateLayout({ aspectRatio: ratio })}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                layout.aspectRatio === ratio ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
              )}
            >
              {ratio === '9:16' ? 'Story (9:16)' : ratio === '1:1' ? 'Square (1:1)' : 'Landscape (16:9)'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-2">Padding</label>
        <input 
          type="range" min="0" max="120" 
          value={layout.padding}
          onChange={(e) => updateLayout({ padding: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700">Dark Overlay</label>
        <input 
          type="checkbox" 
          checked={layout.showOverlay}
          onChange={(e) => updateLayout({ showOverlay: e.target.checked })}
          className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
        />
      </div>

      {layout.showOverlay && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-2">Overlay Opacity</label>
          <input 
            type="range" min="0" max="1" step="0.1"
            value={layout.overlayOpacity}
            onChange={(e) => updateLayout({ overlayOpacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
