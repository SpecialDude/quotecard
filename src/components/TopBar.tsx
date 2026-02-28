import React, { useState } from 'react';
import { Download, Share2, Menu, X, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../store';
import { getAllDrafts, deleteDraft } from '../lib/storage';
import { QuoteDraft } from '../types';
import { cn } from '../lib/utils';

interface TopBarProps {
  onExport: (hd: boolean, format: 'png' | 'jpeg', action: 'download' | 'share') => void;
}

export default function TopBar({ onExport }: TopBarProps) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { createNewDraft } = useAppStore();

  return (
    <>
      <div className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between shadow-sm z-10">
        <button 
          onClick={() => setShowDrafts(true)}
          className="p-2 -ml-2 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <h1 className="font-display font-bold text-lg tracking-tight">QuoteCard</h1>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowExportMenu(true)}
            className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            Export
          </button>
        </div>
      </div>

      {/* Export Menu Modal */}
      {showExportMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Export Options</h2>
              <button onClick={() => setShowExportMenu(false)} className="p-1 text-zinc-400 hover:text-zinc-900 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => { onExport(false, 'png', 'download'); setShowExportMenu(false); }}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors border border-zinc-200"
                >
                  <Download size={24} className="text-zinc-700" />
                  <span className="text-sm font-medium text-zinc-900">Save Image</span>
                  <span className="text-[10px] text-zinc-500">Standard Quality</span>
                </button>
                <button 
                  onClick={() => { onExport(true, 'png', 'download'); setShowExportMenu(false); }}
                  className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors text-white"
                >
                  <Download size={24} />
                  <span className="text-sm font-medium">Save HD</span>
                  <span className="text-[10px] text-zinc-400">High Quality</span>
                </button>
              </div>
              
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-500 mb-3 text-center">Share directly to</p>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => { onExport(true, 'png', 'share'); setShowExportMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">WhatsApp</span>
                  </button>
                  
                  <button 
                    onClick={() => { onExport(true, 'png', 'share'); setShowExportMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#128C7E] text-white flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">Status</span>
                  </button>

                  <button 
                    onClick={() => { onExport(true, 'png', 'share'); setShowExportMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16"></path><path d="M4 20L20 4"></path></svg>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">X Story</span>
                  </button>

                  <button 
                    onClick={() => { onExport(true, 'png', 'share'); setShowExportMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600">FB Story</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 text-center">
                  Select the app from your device's share menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drafts Sidebar */}
      {showDrafts && (
        <DraftsSidebar onClose={() => setShowDrafts(false)} onNew={() => { createNewDraft(); setShowDrafts(false); }} />
      )}
    </>
  );
}

function DraftsSidebar({ onClose, onNew }: { onClose: () => void, onNew: () => void }) {
  const [drafts, setDrafts] = useState<QuoteDraft[]>([]);
  const { loadDraft, draftId: currentDraftId } = useAppStore();

  React.useEffect(() => {
    getAllDrafts().then(setDrafts);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDraft(id);
    setDrafts(drafts.filter(d => d.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-80 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
        <div className="h-14 border-b border-zinc-200 flex items-center justify-between px-4">
          <h2 className="font-semibold text-lg">My Drafts</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-zinc-100">
          <button 
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            New Quote
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {drafts.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-8">No drafts yet.</div>
          ) : (
            drafts.map(draft => (
              <div 
                key={draft.id}
                onClick={() => { loadDraft(draft); onClose(); }}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all group",
                  draft.id === currentDraftId ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">
                    {draft.text || 'Empty quote'}
                  </p>
                  <button 
                    onClick={(e) => handleDelete(draft.id, e)}
                    className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between">
                  <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                  <span>{draft.layout.aspectRatio}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
