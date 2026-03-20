'use client';

import { AgentSelection } from '@/components/AgentSelection';
import { Button } from '@/components/Button';
import { personaConfig } from '@/config/persona.config';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { nyghtMedium } from './fonts/fonts';
import GitHubButton from 'react-github-btn'

export default function HomePage() {
  const [showAgentSelection, setShowAgentSelection] = useState(false);

  const handleAgentSelection = () => {
    setShowAgentSelection(true);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAgentSelection) {
        setShowAgentSelection(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAgentSelection]);

  return (
    <main
      className={clsx(
        'min-h-screen flex flex-col justify-between items-center bg-[#F5F5F5] relative inset-0 h-full w-full',
        showAgentSelection && 'overflow-hidden'
      )}
    >
      {/* Dot pattern background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="fixed top-4 right-4 z-20">
        <GitHubButton href={personaConfig.footer.githubRepo} data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" data-show-count="true" aria-label="Star devfolioco/austingpt on GitHub">Star</GitHubButton>
      </div>

      <div className="z-10 flex flex-col items-center text-center justify-center flex-1 px-6">
        {/* Title block */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={clsx(
              'text-6xl md:text-[7rem] text-[#16A34A] leading-[0.9] tracking-[0.04em]',
              nyghtMedium.className
            )}
          >
            Austin XBT
          </motion.h1>

          {/* Decorative rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 md:mt-6 w-16 h-px bg-[#16A34A]/40"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 md:mt-5 text-xs md:text-sm text-[#8E989C] font-inter font-medium tracking-[0.25em] uppercase"
          >
            {personaConfig.heroSubtitle}
          </motion.p>
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-10"
        >
          <Image
            src={personaConfig.heroAvatarImage}
            alt={personaConfig.heroAvatarAlt}
            width={328}
            height={328}
            className="mx-auto w-[200px] h-[200px] md:w-[300px] md:h-[300px]"
            priority
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 md:mt-10"
        >
          <Button onClick={handleAgentSelection}>{personaConfig.startChatButtonLabel}</Button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="z-10 w-full flex md:flex-row flex-col justify-between text-[#B4BEC0] text-xs md:text-sm font-inter font-light py-6 md:px-16 px-8 gap-3 text-center md:text-left">
        <div>
          Made with {'<3'} by{' '}
          <a href={personaConfig.footer.creditUrl} className="underline hover:text-[#16A34A] transition-colors">
            {personaConfig.footer.credit}
          </a>
          {' '}and{' '}
          <a href="https://bonfires.ai/" className="underline hover:text-[#16A34A] transition-colors">
            Bonfires AI
          </a>
        </div>
        <div className="flex flex-row gap-6 justify-center">
          {personaConfig.footer.socialLinks.map((link) => (
            <a key={link.label} className="underline hover:text-[#16A34A] transition-colors" href={link.url}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAgentSelection && (
          <motion.div
            className="fixed inset-0 z-30 bg-[#F5F5F5]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25 }}
          >
            {/* Same dot pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />

            {/* Close button */}
            <button
              onClick={() => setShowAgentSelection(false)}
              className="absolute top-6 right-6 z-40 w-10 h-10 flex items-center justify-center text-[#5C686D] hover:text-[#16A34A] transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>

            <div className="relative z-10 h-full overflow-auto">
              <AgentSelection onClose={() => setShowAgentSelection(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prefetch avatar images for faster loading */}
      <link rel="prefetch" href={personaConfig.moods.excited.avatarImage} as="image" type="image/gif" />
      <link rel="prefetch" href={personaConfig.moods.critical.avatarImage} as="image" type="image/gif" />
      <link rel="prefetch" href={personaConfig.heroAvatarImage} as="image" type="image/gif" />
    </main>
  );
}
