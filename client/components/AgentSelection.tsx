'use client';

import { MicIcon } from '@/components/icons/MicIcon';
import { personaConfig } from '@/config/persona.config';
import useIsPhone from '@/hooks/useIsPhone';
import { AgentMoodEnum, AgentMoodI } from '@/types/agent';
import { track } from '@vercel/analytics';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const getMoodKey = (mood: AgentMoodI) => (mood === AgentMoodEnum.CRITICAL ? 'critical' : 'excited');

interface AgentSelectionProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const AgentSelection = ({ onClose, ...props }: AgentSelectionProps) => {
  const router = useRouter();
  const isPhone = useIsPhone();
  const [selectedMood, setSelectedMood] = useState<AgentMoodI | null>(null);

  const updateMood = (mood: AgentMoodI) => {
    track('conversation_started', {
      mood,
    });
    router.push(`/talk?mood=${mood}`);
  };

  const handleMoodSelection = (mood: AgentMoodI) => {
    setSelectedMood(mood);
  };

  // Mobile: initial mood picker (tap avatar to select)
  if (isPhone && selectedMood === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6" {...props}>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-inter font-medium tracking-[0.2em] uppercase text-[#8E989C] mb-4"
        >
          Choose your mode
        </motion.h2>

        {[AgentMoodEnum.EXCITED, AgentMoodEnum.CRITICAL].map((mood, i) => {
          const moodKey = getMoodKey(mood);
          const moodConfig = personaConfig.moods[moodKey];
          return (
            <motion.button
              key={mood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              onClick={() => handleMoodSelection(mood)}
              className="w-full max-w-xs bg-white border border-[#E4EAEB] rounded-lg p-6 flex flex-col items-center gap-3 hover:border-[#16A34A] transition-colors active:scale-[0.98]"
            >
              <Image
                src={moodConfig.avatarImage}
                alt={`${moodConfig.label} Avatar`}
                width={120}
                height={120}
                className="w-24 h-24"
                priority
              />
              <span className="text-xl font-inter font-bold tracking-[0.08em] uppercase text-[#171D21]">
                {moodConfig.label}
              </span>
              <span className="text-sm font-inter text-[#8E989C]">
                {moodConfig.subtitle}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Desktop layout (or mobile with a mood selected)
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-6" {...props}>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-sm font-inter font-medium tracking-[0.25em] uppercase text-[#8E989C] mb-12"
      >
        Choose your mode
      </motion.h2>

      <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-12">
        {/* Synthesis (Enthusiastic) */}
        {((isPhone && selectedMood === AgentMoodEnum.EXCITED) || !isPhone) && (
          <PersonaCard
            mood={AgentMoodEnum.EXCITED}
            onMoodSelection={updateMood}
            isPhone={isPhone}
            onBack={() => setSelectedMood(null)}
            delay={0.15}
          />
        )}

        {/* Divider */}
        {!isPhone && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="hidden md:block w-px bg-[#E4EAEB] self-stretch my-8"
          />
        )}

        {/* Tough Love (Critical) */}
        {((isPhone && selectedMood === AgentMoodEnum.CRITICAL) || !isPhone) && (
          <PersonaCard
            mood={AgentMoodEnum.CRITICAL}
            onMoodSelection={updateMood}
            isPhone={isPhone}
            onBack={() => setSelectedMood(null)}
            delay={0.25}
          />
        )}
      </div>
    </div>
  );
};

const PersonaCard = ({
  mood,
  onMoodSelection,
  onBack,
  isPhone,
  delay = 0,
}: {
  mood: AgentMoodI;
  onMoodSelection: (mood: AgentMoodI) => void;
  onBack: () => void;
  isPhone: boolean;
  delay?: number;
}) => {
  const moodKey = getMoodKey(mood);
  const moodConfig = personaConfig.moods[moodKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center text-center max-w-md mx-auto"
    >
      <div className="mb-8">
        <Image
          src={moodConfig.avatarImage}
          alt={`${moodConfig.label} Avatar`}
          width={200}
          height={200}
          className="w-36 h-36 md:w-48 md:h-48"
          priority
        />
      </div>

      <h2 className="text-2xl md:text-3xl text-[#171D21] mb-3 font-inter font-bold tracking-[0.1em] uppercase">
        {moodConfig.label}
      </h2>

      <p className="text-base md:text-lg text-[#5C686D] mb-2 font-inter font-light max-w-[320px]">
        {moodConfig.subtitle}
      </p>

      <p className="text-sm md:text-base text-[#8E989C] mb-10 max-w-[320px] font-inter font-light leading-relaxed">
        {moodConfig.description}
      </p>

      <button
        onClick={() => onMoodSelection(mood)}
        className={clsx(
          'flex items-center justify-center gap-2.5 py-3.5 px-10 rounded-none font-inter font-semibold text-base tracking-[0.1em] uppercase transition-all',
          'text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-[0.97]',
          isPhone && 'w-full'
        )}
      >
        <MicIcon color="white" />
        Start talking
      </button>

      {isPhone && (
        <button
          onClick={onBack}
          className="mt-4 py-3 px-10 w-full font-inter font-medium text-base text-[#8E989C] hover:text-[#171D21] transition-colors tracking-[0.05em] uppercase"
        >
          Back
        </button>
      )}
    </motion.div>
  );
};
