import React, { useRef, useEffect, useState } from 'react';
import { Lock, CheckCircle } from 'lucide-react';

interface ScratchCardProps {
  card: {
    id: number;
    title: string;
    image: string;
    cover?: string;
  };
  number?: number;
  isCompleted?: boolean;
  onReveal?: () => void;
  scratchable?: boolean;
}

const ScratchCard = ({ card, number, isCompleted = false, onReveal, scratchable = false }: ScratchCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScratchingRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [transform, setTransform] = useState('');

  const showScratchLayer = !isCompleted && !isRevealed;

  const setupCanvas = () => {
    if (!showScratchLayer) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(dpr, dpr);
    context.fillStyle = '#e5e7eb'; // gray-200
    context.fillRect(0, 0, rect.width, rect.height);
  };

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [showScratchLayer]);

  const getBrushPos = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: x - rect.left, y: y - rect.top };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.globalCompositeOperation = 'destination-out';
    
    const radius = 50; // Large circular brush
    
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  };

  const checkRevealPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    const totalPixels = (canvas.width * canvas.height) / ((window.devicePixelRatio || 1) ** 2);
    const percentage = (transparentPixels / totalPixels) * 100;
    
    if (percentage > 60) {
      setIsRevealed(true);
      onReveal?.();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isScratchingRef.current) return;
    const { x, y } = getBrushPos(e.clientX, e.clientY);
    scratch(x, y);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isScratchingRef.current) return;
    const { x, y } = getBrushPos(e.touches[0].clientX, e.touches[0].clientY);
    scratch(x, y);
  };

  const handleInteractionEnd = () => {
    if (!isScratchingRef.current) return;
    isScratchingRef.current = false;
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleInteractionEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleInteractionEnd);
    
    checkRevealPercentage();
  };

  const handleInteractionStart = (clientX: number, clientY: number) => {
    if (!scratchable || !showScratchLayer) return;
    isScratchingRef.current = true;
    const { x, y } = getBrushPos(clientX, clientY);
    scratch(x, y);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleInteractionEnd);
  };

  useEffect(() => {
    return () => {
      if (isScratchingRef.current) {
        handleInteractionEnd();
      }
    };
  }, []);

  const handleParallaxMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showScratchLayer) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    const rotateX = ((y / height) - 0.5) * -20;
    const rotateY = ((x / width) - 0.5) * 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
  };

  const handleParallaxLeave = () => {
    setTransform('');
  };

  return (
    <div 
      ref={containerRef} 
      className="relative aspect-[9/14] w-full rounded-lg overflow-hidden shadow-lg"
      onMouseMove={handleParallaxMove}
      onMouseLeave={handleParallaxLeave}
    >
      <img 
        src={isCompleted && card.cover ? card.cover : card.image} 
        alt={card.title} 
        className="w-full h-full object-cover transition-transform duration-200 ease-out"
        style={{ transform: transform }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-4 text-white text-center">
        <h3 className="font-bold text-lg drop-shadow-md">{card.title}</h3>
      </div>

      {number && (
        <div className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-sm font-bold text-white shadow-lg">
          #{number}
        </div>
      )}

      <div className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${showScratchLayer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <canvas 
          ref={canvasRef} 
          className={`w-full h-full ${scratchable ? 'cursor-crosshair' : ''}`}
          onMouseDown={(e) => handleInteractionStart(e.clientX, e.clientY)}
          onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
          <Lock className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">{card.title}</h3>
          <p className="text-sm text-muted-foreground mt-2">Raspe para revelar</p>
        </div>
      </div>

      {isCompleted && (
        <div className="absolute inset-0 bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="h-16 w-16 text-white/80" />
        </div>
      )}
    </div>
  );
};

export default ScratchCard;