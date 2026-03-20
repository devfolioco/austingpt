import { nyghtMedium } from '@/app/fonts/fonts';
import { personaConfig } from '@/config/persona.config';
import { AgentMoodI } from '@/types/agent';
import { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface PersonaFrameProps {
  idea: string;
  mood: AgentMoodI;
  onImageReady: (base64Image: string) => void;
  onError: (error: Error) => void;
  className?: string;
}

const frameWidth = 650;
const frameHeight = 340;

const MAX_IDEA_WIDTH = 380;

function resizeCanvas(canvas: HTMLCanvasElement) {
  const { devicePixelRatio: ratio = 1 } = window;
  const context = canvas.getContext('2d');

  if (!context) return;

  canvas.width = frameWidth * ratio;
  canvas.height = frameHeight * ratio;
  context.scale(ratio, ratio);
}

const drawDotPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const spacing = 18;
  const radius = 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const drawRoughEllipse = (
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number,
  {
    ideaTextWidth,
    ideaCenterY,
  }: {
    ideaTextWidth: number;
    ideaCenterY: number;
  }
) => {
  const rc = rough.canvas(canvasElement);
  const centerX = width / 2;
  const ellipseWidth = ideaTextWidth + 70;
  const ellipseHeight = 90;

  const jitter = 8;
  const roughness = 1;

  rc.ellipse(centerX, ideaCenterY, ellipseWidth, ellipseHeight, {
    stroke: '#16A34A',
    strokeWidth: 3,
    roughness,
  });
  rc.ellipse(centerX + jitter, ideaCenterY - 2, ellipseWidth, ellipseHeight, {
    stroke: '#16A34A',
    strokeWidth: 1.5,
    roughness,
  });
  rc.ellipse(centerX - jitter, ideaCenterY + 3, ellipseWidth, ellipseHeight, {
    stroke: '#16A34A',
    strokeWidth: 1.5,
    roughness,
  });
};

const drawFrame = async (
  canvasElement: HTMLCanvasElement,
  width: number,
  height: number,
  idea: string,
  mood: AgentMoodI
) => {
  resizeCanvas(canvasElement);

  const ctx = canvasElement.getContext('2d');

  if (!ctx) return;

  // Background
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(0, 0, width, height);

  // Halftone dot pattern
  drawDotPattern(ctx, width, height);

  // Decorative top accent line
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(width / 2 - 30, 28, 60, 2);

  // Title: "Ethereum"
  ctx.textAlign = 'center';
  ctx.fillStyle = '#171D21';
  ctx.font = `bold 52px ${nyghtMedium.style.fontFamily}`;
  ctx.fillText(personaConfig.shareFrame.title, width / 2, height / 3 - 10);

  // Subtitle: "is for"
  ctx.font = `normal 36px ${nyghtMedium.style.fontFamily}`;
  ctx.fillStyle = '#5C686D';
  ctx.fillText(personaConfig.shareFrame.subtitle, width / 2, height / 3 + 35);

  // Idea text — measure and scale
  ctx.font = `bold 50px ${nyghtMedium.style.fontFamily}`;
  const expectedIdeaTextWidth = ctx.measureText(idea).width;
  const scaleDownRatio = expectedIdeaTextWidth > MAX_IDEA_WIDTH ? MAX_IDEA_WIDTH / expectedIdeaTextWidth : 1;
  const ideaFontSize = 50 * scaleDownRatio;

  ctx.font = `bold ${ideaFontSize}px ${nyghtMedium.style.fontFamily}`;
  const ideaTextWidth = ctx.measureText(idea).width;

  const ideaY = height / 3 + (110 - (1 - scaleDownRatio) * 14);
  ctx.fillStyle = '#171D21';
  ctx.fillText(idea, width / 2, ideaY);

  // Draw rough ellipses around the idea
  drawRoughEllipse(canvasElement, frameWidth, frameHeight, {
    ideaTextWidth,
    ideaCenterY: ideaY - ideaFontSize * 0.25,
  });

  // Bottom branding: "SYNTHESIS" in small caps
  ctx.font = '500 10px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#B4BEC0';
  ctx.textAlign = 'right';
  ctx.letterSpacing = '3px';
  ctx.fillText('S Y N T H E S I S', width - 24, height - 18);

  // Bottom-left accent mark
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(24, height - 24, 20, 2);
};

const PersonaFrame = ({ idea, onImageReady, onError, mood, className }: PersonaFrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `ethereum-is-for-${idea.toLowerCase().replace(' ', '-')}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        handleDownload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const renderFrame = async () => {
    try {
      if (canvasRef.current) {
        await drawFrame(canvasRef.current, frameWidth, frameHeight, idea, mood);
        const image = canvasRef.current.toDataURL();
        onImageReady(image);
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      renderFrame();
    }

    return () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };
  }, [idea, renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      className={`w-full h-full ${nyghtMedium.className} ${className}`}
    ></canvas>
  );
};

export const PrefetchPersonaFrameAssets = () => {
  return null;
};

export default PersonaFrame;
