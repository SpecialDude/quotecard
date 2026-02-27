import React, { useRef } from 'react';
import { AppProvider } from './store';
import CanvasPreview, { CanvasPreviewRef } from './components/CanvasPreview';
import EditorControls from './components/EditorControls';
import TopBar from './components/TopBar';

function MainApp() {
  const canvasRef = useRef<CanvasPreviewRef>(null);

  const handleExport = async (hd: boolean, format: 'png' | 'jpeg', action: 'download' | 'share') => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = canvasRef.current.exportImage(hd, format);
      
      if (action === 'download') {
        const link = document.createElement('a');
        link.download = `quotecard-${Date.now()}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (action === 'share') {
        // Convert dataUrl to Blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `quotecard-${Date.now()}.${format}`, { type: `image/${format}` });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My QuoteCard',
            text: 'Check out this quote I made!',
            files: [file],
          });
        } else {
          // Fallback if Web Share API files not supported
          alert('Sharing files is not supported on this browser. The image will be downloaded instead.');
          const link = document.createElement('a');
          link.download = `quotecard-${Date.now()}.${format}`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-50 overflow-hidden font-sans">
      <TopBar onExport={handleExport} />
      
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-zinc-100 overflow-hidden">
          <CanvasPreview ref={canvasRef} />
        </div>
        
        {/* Controls Area */}
        <div className="h-1/2 md:h-full md:w-96 flex-shrink-0 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.05)] z-10">
          <EditorControls />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
