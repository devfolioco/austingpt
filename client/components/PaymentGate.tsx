'use client';

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

  const { step, error, sessionToken, connectWallet, startPayment, reset, isLoading } = useVoiceSession();

  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && step === 'DISCONNECTED') {
      connectWallet();
    }
  }, [isConnected, step, connectWallet]);

  useEffect(() => {
    if (step === 'SESSION_READY' && sessionToken) {
      const timer = setTimeout(() => onSessionReady(sessionToken), 800);
      return () => clearTimeout(timer);
    }
  }, [step, sessionToken, onSessionReady]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F5F5] relative overflow-hidden">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
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
            className="w-28 h-28 md:w-40 md:h-40"
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl md:text-4xl text-[#171D21] mt-6 font-inter font-bold tracking-[0.15em] uppercase"
        >
          {moodConfig.label}
        </motion.h1>

        {/* Price tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 flex items-center gap-2"
        >
          <span className="text-[#8E989C] font-inter text-sm tracking-wide uppercase">Session</span>
          <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded-full bg-[#16A34A] text-white">
            ${PAYMENT_AMOUNT} USDC
          </span>
        </motion.div>

        {/* Status line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-6 text-[#5C686D] font-inter text-sm h-5"
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
                    backgroundColor: isActive ? '#16A34A' : 'rgba(0,0,0,0.12)',
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
                  'w-full py-4 text-lg font-semibold transition-all font-inter tracking-[0.08em] uppercase',
                  'border-2 border-[#E4EAEB] text-[#171D21] bg-white',
                  'hover:border-[#16A34A] hover:text-[#16A34A]',
                  'active:scale-[0.98]'
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
                  'w-full py-4 text-lg font-semibold transition-all font-inter tracking-[0.08em] uppercase',
                  'active:scale-[0.98]',
                  'bg-[#16A34A] text-white hover:bg-[#15803D]'
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
                <div className="w-8 h-8 border-2 border-[#16A34A]/40 border-t-transparent rounded-full animate-spin" />
                <span className="text-[#8E989C] font-inter text-xs">
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
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#16A34A]"
                >
                  <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
                <span className="text-[#5C686D] font-inter text-sm">{'Connecting to voice agent\u2026'}</span>
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
                <p className="text-[#DC2626] font-inter text-sm max-w-xs">{error}</p>
                <button
                  onClick={reset}
                  className={clsx(
                    'px-6 py-2.5 text-sm font-medium',
                    'border-2 border-[#E4EAEB] text-[#5C686D] hover:text-[#171D21] hover:border-[#16A34A]',
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
          className="mt-10 text-[#B4BEC0] font-inter text-[11px] leading-relaxed max-w-xs"
        >
          Powered by x402 micropayments on Base.
          <br />
          Session tokens are single-use and expire after 10 minutes.
        </motion.p>
      </motion.div>
    </main>
  );
}
