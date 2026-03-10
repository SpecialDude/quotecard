import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Rnd } from 'react-rnd';
import { toPng, toJpeg } from 'html-to-image';
import { useAppStore } from '../store';
import { TEMPLATES } from '../lib/templates';

export interface CanvasPreviewRef {
  exportImage: (hd: boolean, format: 'png' | 'jpeg') => Promise<string>;
}

const CanvasPreview = forwardRef<CanvasPreviewRef, {}>((props, ref) => {
  const { text, author, format, templateId, layout, customPhotoUrl, updateLayout } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, scale: 1 });

  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

  // Calculate base dimensions based on aspect ratio
  const getBaseDimensions = () => {
    switch (layout.aspectRatio) {
      case '1:1': return { w: 1080, h: 1080 };
      case '16:9': return { w: 1920, h: 1080 };
      case '9:16':
      default: return { w: 1080, h: 1920 };
    }
  };

  const baseDim = getBaseDimensions();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const { clientWidth, clientHeight } = container;
      
      // Fit the base dimensions into the container
      const scaleX = clientWidth / baseDim.w;
      const scaleY = clientHeight / baseDim.h;
      const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave some margin

      setDimensions({
        width: baseDim.w * scale,
        height: baseDim.h * scale,
        scale,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [baseDim.w, baseDim.h]);

  useImperativeHandle(ref, () => ({
    exportImage: async (hd: boolean, format: 'png' | 'jpeg') => {
      if (!captureRef.current) return '';
      
      const pixelRatio = hd ? 2 : 1;
      const options = {
        pixelRatio,
        quality: format === 'jpeg' ? 0.9 : 1,
        width: baseDim.w,
        height: baseDim.h,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      };

      try {
        if (format === 'jpeg') {
          return await toJpeg(captureRef.current, options);
        } else {
          return await toPng(captureRef.current, options);
        }
      } catch (err) {
        console.error('Failed to export image', err);
        throw err;
      }
    }
  }));

  const bgUrl = template.type === 'photo' 
    ? (template.id === 'photo-custom' ? customPhotoUrl : template.background) 
    : undefined;

  const getBackgroundStyle = (): React.CSSProperties => {
    if (template.type === 'solid') {
      return { backgroundColor: template.background };
    }
    if (template.type === 'photo' && bgUrl) {
      return { 
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    if (template.type === 'gradient' || template.type === 'pattern') {
      return { background: template.background };
    }
    return { backgroundColor: '#ffffff' };
  };

  const textStyle: React.CSSProperties = {
    fontFamily: format.fontFamily,
    fontSize: `${format.fontSize}px`,
    lineHeight: format.lineHeight,
    color: format.color,
    letterSpacing: `${format.letterSpacing}px`,
    textShadow: format.shadowIntensity > 0 
      ? `${format.shadowIntensity / 10}px ${format.shadowIntensity / 10}px ${format.shadowIntensity * 2}px rgba(0,0,0,${format.shadowIntensity / 100})`
      : 'none',
    textAlign: format.align as any,
    fontWeight: format.isBold ? 'bold' : 'normal',
    fontStyle: format.isItalic ? 'italic' : 'normal',
    textDecoration: format.isUnderline ? 'underline' : 'none',
  };

  const padding = layout.padding;
  const maxTextWidth = baseDim.w - padding * 2;

  const [localPos, setLocalPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Sync local pos when layout changes from outside
  useEffect(() => {
    if (!isDragging.current) {
      // Handle legacy drafts that might have x=0.5
      let x = layout.textPosition.x;
      let y = layout.textPosition.y;
      
      if (x === 0.5 && y === 0.5) {
        x = 0;
        y = 0.3;
      }

      setLocalPos({
        x: padding + x * baseDim.w,
        y: y * baseDim.h
      });
    }
  }, [layout.textPosition.x, layout.textPosition.y, baseDim.w, baseDim.h, padding]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-zinc-100 overflow-hidden">
      {dimensions.width > 0 && (
        <div 
          className="shadow-2xl bg-white relative overflow-hidden" 
          style={{ 
            width: dimensions.width, 
            height: dimensions.height 
          }}
        >
          <div 
            ref={captureRef}
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: baseDim.w,
              height: baseDim.h,
              transform: `scale(${dimensions.scale})`,
              ...getBackgroundStyle()
            }}
          >
            {layout.showOverlay && (
              <div 
                className="absolute inset-0 bg-black" 
                style={{ opacity: layout.overlayOpacity }} 
              />
            )}

            {layout.showBorder && (
              <div 
                className="absolute"
                style={{
                  top: padding / 2,
                  left: padding / 2,
                  right: padding / 2,
                  bottom: padding / 2,
                  border: `${layout.borderWidth}px solid ${layout.borderColor}`,
                  pointerEvents: 'none'
                }}
              />
            )}

            <Rnd
              position={localPos}
              scale={dimensions.scale}
              onDragStart={() => { isDragging.current = true; }}
              onDrag={(e, d) => {
                setLocalPos({ x: d.x, y: d.y });
              }}
              onDragStop={(e, d) => {
                isDragging.current = false;
                updateLayout({
                  textPosition: {
                    x: (d.x - padding) / baseDim.w,
                    y: d.y / baseDim.h,
                  }
                });
              }}
              enableResizing={false}
              bounds="parent"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: format.align === 'center' ? 'center' : format.align === 'right' ? 'flex-end' : 'flex-start',
                width: maxTextWidth,
                cursor: 'move'
              }}
            >
              <div 
                style={textStyle}
                className="w-full outline-none"
                dangerouslySetInnerHTML={{ __html: text || 'Your quote here...' }}
              />
              {author && (
                <div 
                  style={{
                    ...textStyle,
                    fontSize: `${format.fontSize * 0.6}px`,
                    marginTop: `${format.fontSize * 0.5}px`,
                    fontStyle: format.isItalic ? 'italic' : 'normal'
                  }}
                >
                  — {author}
                </div>
              )}
            </Rnd>
          </div>
        </div>
      )}
    </div>
  );
});

export default CanvasPreview;
