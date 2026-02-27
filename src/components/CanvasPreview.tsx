import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useAppStore } from '../store';
import { TEMPLATES } from '../lib/templates';

export interface CanvasPreviewRef {
  exportImage: (hd: boolean, format: 'png' | 'jpeg') => string;
}

const CanvasPreview = forwardRef<CanvasPreviewRef, {}>((props, ref) => {
  const { text, author, format, templateId, layout, customPhotoUrl, updateLayout } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
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
    exportImage: (hd: boolean, format: 'png' | 'jpeg') => {
      if (!stageRef.current) return '';
      // We want to export at base dimensions (or 2x for HD)
      const pixelRatio = (hd ? 2 : 1) / dimensions.scale;
      return stageRef.current.toDataURL({
        pixelRatio,
        mimeType: `image/${format}`,
        quality: format === 'jpeg' ? 0.9 : undefined,
      });
    }
  }));

  // Load background image if needed
  const bgUrl = template.type === 'photo' 
    ? (template.id === 'photo-custom' ? customPhotoUrl : template.background) 
    : undefined;
  
  const [bgImage] = useImage(bgUrl || '', 'anonymous');

  // Background rendering logic
  const renderBackground = () => {
    if (template.type === 'solid') {
      return <Rect width={baseDim.w} height={baseDim.h} fill={template.background} />;
    }
    if (template.type === 'photo' && bgImage) {
      // Cover logic
      const scale = Math.max(baseDim.w / bgImage.width, baseDim.h / bgImage.height);
      const w = bgImage.width * scale;
      const h = bgImage.height * scale;
      const x = (baseDim.w - w) / 2;
      const y = (baseDim.h - h) / 2;
      return <KonvaImage image={bgImage} x={x} y={y} width={w} height={h} />;
    }
    if (template.type === 'gradient') {
      // Konva doesn't support CSS gradients directly, we can approximate or use a solid fallback
      // For a real app, we'd parse the CSS gradient. Here we do a simple linear gradient.
      let colorStops: (number | string)[] = [0, '#000', 1, '#fff'];
      if (template.id === 'grad-sunset') colorStops = [0, '#f97316', 1, '#eab308'];
      if (template.id === 'grad-ocean') colorStops = [0, '#0ea5e9', 1, '#3b82f6'];
      if (template.id === 'grad-aurora') colorStops = [0, '#10b981', 1, '#3b82f6'];
      if (template.id === 'grad-twilight') colorStops = [0, '#8b5cf6', 1, '#ec4899'];
      
      return (
        <Rect 
          width={baseDim.w} 
          height={baseDim.h} 
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: baseDim.w, y: baseDim.h }}
          fillLinearGradientColorStops={colorStops}
        />
      );
    }
    if (template.type === 'pattern') {
      // Fallback for pattern
      return <Rect width={baseDim.w} height={baseDim.h} fill="#e2e8f0" />;
    }
    return <Rect width={baseDim.w} height={baseDim.h} fill="#ffffff" />;
  };

  const textStyle = {
    fontFamily: format.fontFamily,
    fontSize: format.fontSize,
    fontStyle: `${format.isItalic ? 'italic ' : ''}${format.isBold ? 'bold' : 'normal'}`,
    textDecoration: format.isUnderline ? 'underline' : '',
    align: format.align,
    lineHeight: format.lineHeight,
    fill: format.color,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: format.shadowIntensity * 2,
    shadowOpacity: format.shadowIntensity > 0 ? format.shadowIntensity / 100 : 0,
    shadowOffsetX: format.shadowIntensity / 10,
    shadowOffsetY: format.shadowIntensity / 10,
  };

  const padding = layout.padding;
  const maxTextWidth = baseDim.w - padding * 2;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-zinc-100 overflow-hidden">
      {dimensions.width > 0 && (
        <div className="shadow-2xl bg-white" style={{ width: dimensions.width, height: dimensions.height }}>
          <Stage 
            ref={stageRef}
            width={dimensions.width} 
            height={dimensions.height} 
            scaleX={dimensions.scale} 
            scaleY={dimensions.scale}
          >
            <Layer>
              {renderBackground()}
              
              {layout.showOverlay && (
                <Rect 
                  width={baseDim.w} 
                  height={baseDim.h} 
                  fill="black" 
                  opacity={layout.overlayOpacity} 
                />
              )}

              {layout.showBorder && (
                <Rect 
                  x={padding / 2} 
                  y={padding / 2} 
                  width={baseDim.w - padding} 
                  height={baseDim.h - padding} 
                  stroke={layout.borderColor} 
                  strokeWidth={layout.borderWidth} 
                />
              )}

              <Group 
                x={baseDim.w * layout.textPosition.x} 
                y={baseDim.h * layout.textPosition.y}
                draggable
                onDragEnd={(e) => {
                  updateLayout({
                    textPosition: {
                      x: e.target.x() / baseDim.w,
                      y: e.target.y() / baseDim.h,
                    }
                  });
                }}
              >
                <Text
                  text={text || 'Your quote here...'}
                  width={maxTextWidth}
                  offsetX={maxTextWidth / 2}
                  offsetY={format.fontSize} // Rough vertical center
                  {...textStyle}
                  letterSpacing={format.letterSpacing}
                />
                {author && (
                  <Text
                    text={`— ${author}`}
                    y={format.fontSize * 1.5} // Below the quote
                    width={maxTextWidth}
                    offsetX={maxTextWidth / 2}
                    {...textStyle}
                    fontSize={format.fontSize * 0.6}
                    fontStyle={format.isItalic ? 'italic' : 'normal'}
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
});

export default CanvasPreview;
