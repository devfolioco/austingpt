import { isZoraMintingEnabled } from '@/config/persona.config';
import { getFarcasterCopy, getTweetCopy, getTwitterIntentURL, getWarpcastIntentURL } from '@/helpers/copy';
import { useCoinOnZora } from '@/hooks/useCoinOnZora';
import { AgentMoodEnum, AgentMoodI, AgentShareData, ZoraCoinFlowStep } from '@/types/agent';
import { track } from '@vercel/analytics';
import confetti from 'canvas-confetti';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import EditIdea from './EditIdea';
import PersonaFrame from './PersonaFrame';
import Snackbar from './Snackbar';
import { CloseIcon } from './icons/CloseIcon';
import { FarcasterIcon } from './icons/FarcasterIcon';
import { MicIcon } from './icons/MicIcon';
import { XIcon } from './icons/XIcon';
import { ZoraIcon } from './icons/ZoraIcon';

interface ShareModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  data: AgentShareData;
  mood: AgentMoodI;
}

enum ShareModalError {
  FRAME_RENDER_ERROR = 'frame-render-error',
  ZORA_COIN_CREATION_ERROR = 'zora-coin-creation-error',
  INSUFFICIENT_WALLET_BALANCE = 'insufficient-wallet-balance',
}

const getZoraStateCopy = (status: ZoraCoinFlowStep, isCoiningDelayed: boolean) => {
  switch (status) {
    case ZoraCoinFlowStep.CONNECTING_WALLET:
      return 'Connecting wallet...';
    case ZoraCoinFlowStep.UPLOADING_IMAGE:
      return 'Generating post...';
    case ZoraCoinFlowStep.CREATING_COIN:
      return isCoiningDelayed
        ? 'Please wait, this is taking longer than expected...'
        : 'Creating your coin on Zora. This may take around 2 minutes...';
    default:
      return 'Coin on Zora';
  }
};

const getZoraStateCopyError = (error: ShareModalError) => {
  switch (error) {
    case ShareModalError.INSUFFICIENT_WALLET_BALANCE:
      return 'Insufficient wallet balance. Add some ETH and try again.';
    case ShareModalError.FRAME_RENDER_ERROR:
      return 'Unable to render the idea frame. Try using a different browser.';
    case ShareModalError.ZORA_COIN_CREATION_ERROR:
      return 'Unable to create the Zora coin. Please try again.';
    default:
      return 'Unable to create the Zora coin. Please try again.';
  }
};

const ShareModal = ({ data: initialData, onClose, mood, isOpen, roomId }: ShareModalProps) => {
  const handleDefaultClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const [data, setData] = useState<AgentShareData>(initialData);
  const [error, setError] = useState<ShareModalError | null>(null);

  const ideaImageRef = useRef<string | null>(null);

  const {
    onClick: onZoraClick,
    isLoading,
    result: zoraResult,
    status: zoraStatus,
  } = useCoinOnZora({
    roomId: roomId,
    title: data.oneLiner,
    description: data.summary,
    base64Image: ideaImageRef.current,
    onSuccess: result => {
      setTimeout(() => {
        triggerConfetti();
        setZoraToastVisible(true);
        track('zora_coined', {
          title: data.oneLiner,
          roomId: roomId,
          zoraLink: result.zoraLink,
          mood,
        });
      }, 1000);
    },
    onFailure: error => {
      console.error('Error creating Zora coin', error);

      if (error.message === 'Insufficient balance') {
        setError(ShareModalError.INSUFFICIENT_WALLET_BALANCE);
      } else {
        setError(ShareModalError.ZORA_COIN_CREATION_ERROR);
      }
    },
  });

  const handleCoinOnZoraClick = () => {
    setError(null);
    onZoraClick();

    track('zora_initiated', {
      title: data.oneLiner,
      roomId: roomId,
      mood,
    });
  };

  const onImageReady = (base64Image: string) => {
    ideaImageRef.current = base64Image;
  };

  const handleFrameError = (error: Error) => {
    console.error('Error rendering frame', error);
    setError(ShareModalError.FRAME_RENDER_ERROR);
  };

  const handleTweet = () => {
    const tweetCopy = getTweetCopy({
      title: data.oneLiner,
      summary: data.summary,
      zoraUrl: zoraResult?.zoraLink || null,
    });

    const twitterShareURL = getTwitterIntentURL({ text: tweetCopy });

    window.open(twitterShareURL, '_blank');
  };

  const handleFarcaster = () => {
    const farcasterCopy = getFarcasterCopy({
      title: data.oneLiner,
      summary: data.summary,
      zoraUrl: zoraResult?.zoraLink || null,
    });

    const warpcastShareURL = getWarpcastIntentURL({ text: farcasterCopy });

    window.open(warpcastShareURL, '_blank');
  };
  const router = useRouter();

  const handleChatAgain = () => {
    router.push('/');
  };

  const [zoraSuccessToastVisible, setZoraToastVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editMode) {
          setEditMode(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, editMode]);

  const handleOneLinerChange = (value: string) => {
    setData({ ...data, oneLiner: value });
  };

  const [isCoiningDelayed, setIsCoiningDelayed] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (zoraStatus === ZoraCoinFlowStep.CREATING_COIN) {
      timeout = setTimeout(
        () => {
          setIsCoiningDelayed(true);
        },
        1000 * 60 * 3
      );
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [zoraStatus]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-20 bg-[#F5F5F5]/95 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.2 }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div
            className="relative z-10 flex flex-col items-center gap-4 md:max-w-[682px] w-full bg-white border border-[#E4EAEB] md:rounded-lg p-4 md:p-6 overflow-auto h-full md:h-auto md:max-h-[90vh] md:overflow-visible shadow-lg"
            onClick={handleDefaultClick}
          >
            {!editMode && (
              <button
                className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 flex items-center justify-center hover:opacity-60 transition-opacity cursor-pointer z-10"
                onClick={onClose}
              >
                <CloseIcon color="#5C686D" className="w-5 h-5" />
              </button>
            )}

            <div className="flex flex-col items-start md:rounded-lg md:overflow-hidden w-full">
              <div className="relative w-full">
                <PersonaFrame
                  idea={data.oneLiner}
                  mood={mood}
                  onImageReady={onImageReady}
                  onError={handleFrameError}
                  className="rounded-lg md:rounded-none mb-4 md:mb-0"
                />

                {!editMode && (
                  <button
                    className="absolute right-4 bottom-4 px-4 py-1 rounded-full bg-[#171D21] font-inter text-white font-medium text-sm hover:bg-[#273339] transition-colors"
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <EditIdea value={data.oneLiner} onChange={handleOneLinerChange} onClose={() => setEditMode(false)} />
                )}
              </div>
              <div className="flex justify-center items-center gap-2 py-3 px-2 md:px-4 bg-[#FAFAFA] border-t border-[#E4EAEB] text-[#5C686D] md:text-base text-sm leading-relaxed font-inter w-full">
                {data.summary}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center w-full mt-2">
              <Button
                appearance="colored"
                className="bg-[#16A34A] text-white hover:bg-[#15803D]"
                onClick={handleChatAgain}
                stretch
              >
                <MicIcon color="white" />
                Chat again
              </Button>

              {isZoraMintingEnabled &&
                (zoraResult ? (
                  <Button
                    appearance="colored"
                    className="bg-[#171D21] text-white hover:bg-[#273339]"
                    href={zoraResult.zoraLink}
                    target="_blank"
                    stretch
                  >
                    <ZoraIcon />
                    View on Zora
                  </Button>
                ) : (
                  <Button
                    appearance="colored"
                    className={clsx('bg-[#171D21] hover:bg-[#273339]', isLoading ? 'text-[#8E989C]' : 'text-white')}
                    onClick={handleCoinOnZoraClick}
                    stretch
                    disabled={isLoading}
                  >
                    <ZoraIcon />
                    Coin on Zora
                  </Button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-3 items-center w-full">
              <Button
                appearance="colored"
                className="bg-farcaster text-white"
                onClick={handleFarcaster}
                stretch
              >
                <FarcasterIcon />
                Cast
              </Button>

              <Button
                appearance="colored"
                className="bg-[#171D21] text-white hover:bg-[#273339]"
                onClick={handleTweet}
                stretch
              >
                <XIcon />
                Post
              </Button>
            </div>

            {isZoraMintingEnabled && (
              <div className="flex justify-center text-xs md:text-sm text-[#8E989C] font-inter text-center">
                Note: Coining on Zora requires a small amount of ETH for gas fees
              </div>
            )}

            <AnimatePresence initial={false}>
              {isZoraMintingEnabled &&
                (zoraStatus === ZoraCoinFlowStep.CONNECTING_WALLET ||
                  zoraStatus === ZoraCoinFlowStep.CREATING_COIN ||
                  zoraStatus === ZoraCoinFlowStep.UPLOADING_IMAGE) && (
                  <Snackbar appearance="loading">{getZoraStateCopy(zoraStatus, isCoiningDelayed)}</Snackbar>
                )}

              {isZoraMintingEnabled && zoraSuccessToastVisible && (
                <Snackbar appearance="success">
                  Your idea has been successfully coined on Zora.{' '}
                  <a href={zoraResult?.zoraLink ?? ''} target="_blank" className="underline text-[#16A34A]">
                    Check it out here.
                  </a>
                </Snackbar>
              )}

              {error && <Snackbar appearance="error">{getZoraStateCopyError(error)}</Snackbar>}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const triggerConfetti = () => {
  const canvas = document.createElement('canvas');

  canvas.width = 0;
  canvas.height = 0;

  document.body.appendChild(canvas);

  confetti.create(canvas, {
    resize: true,
  });

  confetti({
    angle: 80,
    spread: 200,
    particleCount: 500,
    startVelocity: 100,
    origin: { y: 0.8, x: 0.9 },
  });

  confetti({
    angle: 80,
    spread: 200,
    particleCount: 500,
    startVelocity: 100,
    origin: { y: 0.8, x: 0.01 },
  });

  confetti({
    spread: 200,
    particleCount: 500,
    startVelocity: 100,
    origin: { y: 0.8 },
  });
};

export default ShareModal;
