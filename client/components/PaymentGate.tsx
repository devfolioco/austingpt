'use client';

import { nyghtMedium } from '@/app/fonts/fonts';
import { personaConfig } from '@/config/persona.config';
import { useVoiceSession, type VoiceSessionStep } from '@/hooks/useVoiceSession';
import { useAppKitAccount } from '@reown/appkit/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect } from 'react';
import type { AgentMoodI } from '@/types/agent';
import { AgentMoodEnum } from '@/types/agent';

const PAYMENT_AMOUNT = process.env.NEXT_PUBLIC_PAYMENT_DEFAULT_AMOUNT ?? '1.00';

interface PaymentGateProps {
  mood: AgentMoodI;
  onSessionReady: (sessionToken: string) => void;
}

const getMoodKey = (mood: AgentMoodI) => (mood === AgentMoodEnum.CRITICAL ? 'critical' : 'excited');

const stepLabels: Record<VoiceSessionStep, string> = {
  DISCONNECTED: 'Connect wallet to begin',
  WALLET_CONNECTED: 'Ready to pay',
  SIGNING: 'Confirm in wallet\u2026',
  PAYMENT_PENDING: 'Settling on-chain\u2026',
  SESSION_READY: 'Session unlocked',
  IN_SESSION: 'In session',
  ENDED: 'Session ended',
  ERROR: 'Something went wrong',
};

export function PaymentGate({ mood, onSessionReady }: PaymentGateProps) {
  const moodKey = getMoodKey(mood);
  const moodConfig = personaConfig.moods[moodKey];
  const isExcited = mood === AgentMoodEnum.EXCITED;

  const { step, error, sessionToken, connectWallet, startPayment, reset, isLoading } = useVoiceSession();

  const { isConnected } = useAppKitAccount();

  // Auto-advance from DISCONNECTED when wallet connects
  useEffect(() => {
    if (isConnected && step === 'DISCONNECTED') {
      connectWallet();
    }
  }, [isConnected, step, connectWallet]);

  // Fire callback when session is ready
  useEffect(() => {
    if (step === 'SESSION_READY' && sessionToken) {
      const timer = setTimeout(() => onSessionReady(sessionToken), 800);
      return () => clearTimeout(timer);
    }
  }, [step, sessionToken, onSessionReady]);

  const accentColor = isExcited ? '#FFF68D' : '#0157FA';
  const accentText = isExcited ? 'text-black' : 'text-white';
  const accentBg = isExcited ? 'bg-[#FFF68D]' : 'bg-[#0157FA]';

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0C1110] relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(${accentColor}33 1px, transparent 1px),
            linear-gradient(90deg, ${accentColor}33 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07]"
        style={{ background: accentColor }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full"
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={moodConfig.avatarImage}
            alt={`${moodConfig.label} Avatar`}
            width={160}
            height={160}
            className="rounded-none w-28 h-28 md:w-40 md:h-40"
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={clsx('text-3xl md:text-4xl text-white mt-6', nyghtMedium.className)}
        >
          {moodConfig.label}
        </motion.h1>

        {/* Price tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 flex items-center gap-2"
        >
          <span className="text-white/50 font-inter text-sm tracking-wide uppercase">Session</span>
          <span
            className={clsx(
              'font-mono text-sm font-bold px-2.5 py-0.5 rounded-full',
              accentBg,
              accentText
            )}
          >
            ${PAYMENT_AMOUNT} USDC
          </span>
        </motion.div>

        {/* Status line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-6 text-white/60 font-inter text-sm h-5"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {stepLabels[step]}
            </motion.span>
          </AnimatePresence>
        </motion.p>

        {/* Progress dots */}
        <div className="mt-4 flex gap-2 items-center">
          {(['DISCONNECTED', 'WALLET_CONNECTED', 'SIGNING', 'SESSION_READY'] as const).map(
            (s, i) => {
              const stepOrder = ['DISCONNECTED', 'WALLET_CONNECTED', 'SIGNING', 'SESSION_READY'];
              const currentIndex = stepOrder.indexOf(
                step === 'PAYMENT_PENDING' ? 'SIGNING' : step === 'ERROR' ? 'WALLET_CONNECTED' : step
              );
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <motion.div
                  key={s}
                  className={clsx(
                    'rounded-full transition-all duration-300',
                    isCurrent && isLoading
                      ? 'w-6 h-2'
                      : isActive
                        ? 'w-2 h-2'
                        : 'w-1.5 h-1.5'
                  )}
                  style={{
                    backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.15)',
                  }}
                  animate={
                    isCurrent && isLoading
                      ? { opacity: [0.5, 1, 0.5] }
                      : {}
                  }
                  transition={
                    isCurrent && isLoading
                      ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                      : {}
                  }
                />
              );
            }
          )}
        </div>

        {/* Action area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 w-full"
        >
          <AnimatePresence mode="wait">
            {step === 'DISCONNECTED' && (
              <motion.button
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={connectWallet}
                className={clsx(
                  'w-full py-4 rounded-lg text-lg font-semibold transition-all',
                  'border-2 border-white/20 text-white bg-white/5',
                  'hover:bg-white/10 hover:border-white/30',
                  'active:scale-[0.98]',
                  nyghtMedium.className
                )}
              >
                Connect Wallet
              </motion.button>
            )}

            {step === 'WALLET_CONNECTED' && (
              <motion.button
                key="pay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={startPayment}
                className={clsx(
                  'w-full py-4 rounded-lg text-lg font-semibold transition-all',
                  'active:scale-[0.98]',
                  accentBg,
                  accentText,
                  'hover:opacity-90',
                  nyghtMedium.className
                )}
              >
                Pay & Start Session
              </motion.button>
            )}

            {(step === 'SIGNING' || step === 'PAYMENT_PENDING') && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${accentColor}60`, borderTopColor: 'transparent' }}
                />
                <span className="text-white/40 font-inter text-xs">
                  {step === 'SIGNING' ? 'Waiting for wallet signature\u2026' : 'Processing payment\u2026'}
                </span>
              </motion.div>
            )}

            {step === 'SESSION_READY' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={clsx('w-12 h-12 rounded-full flex items-center justify-center', accentBg)}
                >
                  <svg className={accentText} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
                <span className="text-white/60 font-inter text-sm">Connecting to voice agent\u2026</span>
              </motion.div>
            )}

            {step === 'ERROR' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <p className="text-red-400/80 font-inter text-sm max-w-xs">{error}</p>
                <button
                  onClick={reset}
                  className={clsx(
                    'px-6 py-2.5 rounded-lg text-sm font-medium',
                    'border border-white/20 text-white/70 hover:text-white hover:border-white/30',
                    'transition-all active:scale-[0.98]'
                  )}
                >
                  Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-10 text-white/25 font-inter text-[11px] leading-relaxed max-w-xs"
        >
          Powered by x402 micropayments on Base.
          <br />
          Session tokens are single-use and expire after 10 minutes.
        </motion.p>
      </motion.div>
    </main>
  );
}
