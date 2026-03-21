import { drukCondSuper, inconsolata, nyghtMedium } from '@/app/fonts/fonts';
import { personaConfig } from '@/config/persona.config';
import { AgentMoodI } from '@/types/agent';
import { useEffect, useRef } from 'react';

interface PersonaFrameProps {
  idea: string;
  mood: AgentMoodI;
  onImageReady: (base64Image: string) => void;
  onError: (error: Error) => void;
  className?: string;
}

const frameWidth = 650;
const frameHeight = 340;

const MAX_IDEA_WIDTH = 460;

const GREEN = '#16A34A';
const BG = '#FAFAFA';
const TEXT_DARK = '#111111';
const TEXT_MID = '#6B7280';
const INCONSOLATA = `${inconsolata.style.fontFamily}, monospace`;

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
  const radius = 0.8;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
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

  // === BACKGROUND ===
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);

  // Subtle dot grid
  drawDotPattern(ctx, width, height);

  // === TOP: PROMPT LINE ===
  ctx.textAlign = 'left';
  ctx.fillStyle = GREEN;
  ctx.font = `500 12px ${INCONSOLATA}`;
  ctx.fillText(personaConfig.shareFrame.prompt, 36, 44);

  // Small green accent bar top-left
  ctx.fillStyle = GREEN;
  ctx.fillRect(36, 54, 24, 2);

  // === "Ethereum is for" MOTIF ===
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT_MID;
  ctx.font = `400 16px ${INCONSOLATA}`;
  const motifY = height / 2 - 30;
  ctx.fillText('Ethereum is for', width / 2, motifY);

  // === IDEA TEXT (Druk Condensed Super — uppercase, bold, condensed) ===
  const ideaUpper = idea.toUpperCase();
  ctx.font = `900 64px ${drukCondSuper.style.fontFamily}`;
  const expectedIdeaTextWidth = ctx.measureText(ideaUpper).width;
  const scaleDownRatio = expectedIdeaTextWidth > MAX_IDEA_WIDTH ? MAX_IDEA_WIDTH / expectedIdeaTextWidth : 1;
  const ideaFontSize = 64 * scaleDownRatio;

  ctx.font = `900 ${ideaFontSize}px ${drukCondSuper.style.fontFamily}`;
  const ideaTextWidth = ctx.measureText(ideaUpper).width;

  const ideaX = width / 2;
  const ideaY = height / 2 + 30;

  // Idea text in dark
  ctx.textAlign = 'center';
  ctx.fillStyle = TEXT_DARK;
  ctx.fillText(ideaUpper, ideaX, ideaY);

  // Green underline — single clean line
  const underlineWidth = ideaTextWidth + 16;
  ctx.fillStyle = GREEN;
  ctx.fillRect(ideaX - underlineWidth / 2, ideaY + 12, underlineWidth, 4);

  // === BOTTOM BRANDING ===
  ctx.font = `600 9px ${INCONSOLATA}`;
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'right';
  ctx.letterSpacing = '3px';
  ctx.fillText('S Y N T H E S I S', width - 32, height - 24);

  // Bottom-left small accent + domain below
  ctx.fillStyle = GREEN;
  ctx.fillRect(36, height - 32, 16, 2);
  ctx.font = `400 9px ${INCONSOLATA}`;
  ctx.fillStyle = '#B0B7BC';
  ctx.textAlign = 'left';
  ctx.fillText('austinxbt.devfolio.co', 36, height - 18);
};

const PersonaFrame = ({ idea, onImageReady, onError, mood, className }: PersonaFrameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `synthesis-${idea.toLowerCase().replace(/\s+/g, '-')}.png`;
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
      className={`w-full h-full ${drukCondSuper.className} ${inconsolata.className} ${nyghtMedium.className} ${className}`}
    ></canvas>
  );
};

export const PrefetchPersonaFrameAssets = () => {
  return null;
};

export default PersonaFrame;
