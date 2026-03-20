'use client';

import { Button } from '@/components/Button';
import { PaymentGate } from '@/components/PaymentGate';
import { PrefetchPersonaFrameAssets } from '@/components/PersonaFrame';
import { personaConfig } from '@/config/persona.config';
import LoadingPage from '@/components/LoadingPage';
import ShareModal from '@/components/ShareModal';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { MicIcon } from '@/components/icons/MicIcon';
import { ShareIcon } from '@/components/icons/ShareIcon';
import useIsPhone from '@/hooks/useIsPhone';
import { AgentMoodEnum, AgentMoodI, AgentShareData } from '@/types/agent';
import { RoomContext } from '@livekit/components-react';
import { track } from '@vercel/analytics';
import clsx from 'clsx';
import { Room, RoomEvent } from 'livekit-client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ConnectionDetails } from '../api/connection-details/route';

// When true, the payment gate is required before voice access
const PAYMENT_GATE_ENABLED = process.env.NEXT_PUBLIC_DELVE_API_URL ? true : false;

const parseMoodQueryParam = (query: string | string[] | null): AgentMoodI | null => {
  if (typeof query === 'string') {
    return query as AgentMoodI;
  }
  return null;
};

// Used for testing
const projectIdeas = [
  'Tax Weighted Voting',
  'Talent Protocol',
  'MailSprint',
  'ZK-Insurance',
  'Fanbase | Coldplay tickets',
  'SwarmSense: Agentic Grant',
  'Airdrop Sentinel',
];

// Used for testing
const testData = {
  oneLiner: projectIdeas[2],
  summary: `
In a world drowning in lengthy emails, MailSprint revolutionizes the way you consume information. This Chrome extension streamlines communication by extracting the essence of any open email and delivering it in a concise easy-to-read summary.
Save time, stay focused, and conquer your inbox with MailSprint.
    `,
};

// only for testing: Enabling this will simulate a successful conversation
const TEST = false;

const initialData = {
  oneLiner: '',
  summary: '',
};

const TalkComponent = () => {
  const searchParams = useSearchParams();
  const mood = parseMoodQueryParam(searchParams.get('mood'));
  const router = useRouter();

  const [room] = useState(new Room());
  const [connecting, setConnecting] = useState(TEST ? true : false);
  const [connected, setConnected] = useState(TEST ? true : false);
  const isInitialRender = useRef(TEST ? true : false);

  // Payment gate state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(!PAYMENT_GATE_ENABLED);

  const [isSummaryReceived, setIsSummaryReceived] = useState(TEST ? true : false);

  const [isConversationEnded, setIsConversationEnded] = useState(TEST ? true : false);

  const [isModalOpen, setIsModalOpen] = useState(TEST ? true : false);

  const finalMintData = useRef<AgentShareData>(TEST ? testData : initialData);

  const [roomId, setRoomId] = useState<string | null>(null);

  const isPhone = useIsPhone();

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleShareModal = () => {
    setIsModalOpen(true);
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error requesting microphone permission', error);
    }
  };

  const handleSessionReady = useCallback((token: string) => {
    setSessionToken(token);
    setPaymentComplete(true);
  }, []);

  async function connect(token?: string | null) {
    try {
      setConnecting(true);
      requestMicrophonePermission();

      const url = new URL(
        process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details',
        window.location.origin
      );

      // Build query params
      const params = new URLSearchParams();
      if (mood) params.set('mood', mood);
      if (token) params.set('session_token', token);

      const response = await fetch(`${url.toString()}?${params.toString()}`);

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(body.detail || body.error || `Connection failed (${response.status})`);
      }

      const connectionDetailsData: ConnectionDetails = await response.json();

      if (connectionDetailsData.roomName) {
        setRoomId(connectionDetailsData.roomName.split('_')[2]); // format is: <mood>_room_<roomId>
      }

      await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);

      room.registerTextStreamHandler('has_enough_information', async (reader, participantInfo) => {
        const info = reader.info;
        console.log(
          `Received text stream from ${participantInfo.identity}\n` +
            `  Topic: ${info.topic}\n` +
            `  Timestamp: ${info.timestamp}\n` +
            `  ID: ${info.id}\n` +
            `  Size: ${info.size}`
        );
        for await (const chunk of reader) {
          console.log(`Has enough information: ${chunk}`);
          setIsConversationEnded(true);
          room.disconnect();
          console.log('room disconnected');

          if (chunk === 'false') {
            handleNotEnoughInformation();
          } else {
            // has enough information
            setIsSummaryReceived(true);
            setIsModalOpen(true);
            track('conversation_ended', {
              title: finalMintData.current.oneLiner,
              roomId: roomId,
              mood,
            });
          }
        }
      });

      room.registerTextStreamHandler('is_inappropriate', async (reader, participantInfo) => {
        const info = reader.info;
        console.log(
          `Received text stream from ${participantInfo.identity}\n` +
            `  Topic: ${info.topic}\n` +
            `  Timestamp: ${info.timestamp}\n` +
            `  ID: ${info.id}\n` +
            `  Size: ${info.size}`
        );
        for await (const chunk of reader) {
          console.log(`Is inappropriate: ${chunk}`);
          if (chunk === 'true') {
            handleIsInappropriate();
          }
        }
      });

      // Register handler for the one liner text stream
      room.registerTextStreamHandler('end_conversation_one_liner', async (reader, participantInfo) => {
        const info = reader.info;
        console.log(
          `Received text stream from ${participantInfo.identity}\n` +
            `  Topic: ${info.topic}\n` +
            `  Timestamp: ${info.timestamp}\n` +
            `  ID: ${info.id}\n` +
            `  Size: ${info.size}`
        );
        for await (const chunk of reader) {
          console.log(`One Liner: ${chunk}`);
          finalMintData.current.oneLiner += chunk;
        }

        if (finalMintData.current.oneLiner) {
          // only use the first 3 words
          finalMintData.current.oneLiner = finalMintData.current.oneLiner.split(' ').slice(0, 3).join(' ');
        }
      });

      // Register handler for the one liner text stream
      room.registerTextStreamHandler('end_conversation_summary', async (reader, participantInfo) => {
        const info = reader.info;
        console.log(
          `Received text stream from ${participantInfo.identity}\n` +
            `  Topic: ${info.topic}\n` +
            `  Timestamp: ${info.timestamp}\n` +
            `  ID: ${info.id}\n` +
            `  Size: ${info.size}`
        );

        for await (const chunk of reader) {
          finalMintData.current.summary += chunk;
          console.log(`Summary: ${chunk}`);
        }
      });

      room.registerTextStreamHandler('agent_version', async (reader, participantInfo) => {
        for await (const chunk of reader) {
          // Logs agent version
          console.log(`CurrentVersion: ${chunk}`);
        }
      });

      setConnected(true);
      setConnecting(false);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (error) {
      console.error('Error connecting to room', error);
    }
  }

  const handleRetry = () => {
    router.push('/');
  };

  const handleNotEnoughInformation = () => {
    console.log('Not enough information');
    room.disconnect();
  };

  const handleIsInappropriate = () => {
    console.log('Is inappropriate');
    room.disconnect();
  };

  useEffect(() => {
    // redirect to home page if no mood is selected
    if (!mood) {
      router.push('/');
    }
  }, [mood, router]);

  // Connect to LiveKit when mood is selected AND payment is complete
  useEffect(() => {
    if (!mood) return;
    if (!paymentComplete) return;
    if (isInitialRender.current) return;

    connect(sessionToken);
    isInitialRender.current = true;
    console.log('connecting to room...');
    return () => {
      console.log('clean up ran');
    };
  }, [room, mood, paymentComplete]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    const handleDisconnected = () => {
      room.removeAllListeners();
      console.log('Disconnected from room');
    };

    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  // Persona selection UI
  if (!mood) {
    return <></>;
  }

  // Payment gate — show before voice session
  if (!paymentComplete && PAYMENT_GATE_ENABLED) {
    return <PaymentGate mood={mood} onSessionReady={handleSessionReady} />;
  }

  // Show loading state while connecting
  if (connecting && !connected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="text-[#171D21] text-lg md:text-2xl font-bold mb-4 px-8 md:px-0 text-center font-inter tracking-[0.05em]">
            Connecting to {personaConfig.moods[mood === AgentMoodEnum.EXCITED ? 'excited' : 'critical'].connectingLabel}...
          </div>
          <div className="w-10 h-10 border-3 border-[#16A34A]/40 border-t-[#16A34A] rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  // Voice assistant UI
  return (
    <main data-lk-theme="default" className="h-full grid content-center bg-[#F5F5F5]">
      {/* Prefetch assets for the PersonaFrame */}
      <PrefetchPersonaFrameAssets />

      <RoomContext.Provider value={room}>
        <div className="lk-room-container max-h-[90vh]">
          <VoiceAssistant mood={mood} hideControls={isConversationEnded} />
        </div>
      </RoomContext.Provider>

      {isConversationEnded && (
        <div className="w-full flex flex-col md:flex-row items-center justify-center fixed bottom-0 left-0 px-4 py-8 z-10 gap-4 md:gap-6">
          <Button
            appearance="colored"
            stretch={isPhone}
            className={clsx(
              mood === AgentMoodEnum.EXCITED ? 'text-white bg-synthesis' : 'text-white bg-synthesis-dark shadow-lg'
            )}
            onClick={handleRetry}
          >
            <MicIcon color="white" />
            Chat again
          </Button>

          {/* <Button appearance="colored" className="bg-white text-black" href={BASE_BATCH_APPLY_URL} target="_blank">
            <DevfolioIcon color="black" />
            <span className="-translate-y-[1.5px]">Apply to Base Batches</span>
          </Button> */}

          {isSummaryReceived && (
            <Button
              stretch={isPhone}
              appearance="colored"
              className="bg-white text-black shadow-lg"
              onClick={handleShareModal}
            >
              <ShareIcon color="black" />
              Share on socials
            </Button>
          )}
        </div>
      )}

      <ShareModal
        isOpen={isModalOpen}
        data={finalMintData.current}
        mood={mood}
        onClose={handleModalClose}
        roomId={roomId ?? ''}
      />
    </main>
  );
};

export default function TalkPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <TalkComponent />
    </Suspense>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab'
  );
}
