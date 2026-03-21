'use client';

import ShareModal from '@/components/ShareModal';
import { AgentMoodEnum } from '@/types/agent';
import { useState } from 'react';

const PRESETS = [
  'Decentralized Agents',
  'Global Unity',
  'Onchain Identity',
  'Transparent Finance',
  'AI Agents',
  'ZK Proofs',
];

export default function DevSharePage() {
  const [idea, setIdea] = useState('Decentralized Agents');
  const [summary, setSummary] = useState(
    'A decentralized network where autonomous agents collaborate, interact, and execute tasks transparently—empowering users to build trustless systems, automate workflows, and unlock new forms of digital cooperation.'
  );
  const [mood, setMood] = useState<AgentMoodEnum>(AgentMoodEnum.EXCITED);
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8 font-inter">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Share Image / Modal Dev Preview</h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Idea (one-liner)</label>
          <input
            type="text"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white"
          />
          <div className="flex flex-wrap gap-2 mt-1">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setIdea(p)}
                className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Summary</label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={3}
            className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Mood</label>
          <div className="flex gap-3">
            {Object.values(AgentMoodEnum).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  mood === m ? 'bg-[#00FF41] text-black' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#00FF41] text-black font-medium py-3 rounded hover:bg-[#00CC33] transition-colors"
        >
          Open Share Modal
        </button>
      </div>

      <ShareModal
        roomId="dev-test"
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        data={{ oneLiner: idea, summary }}
        mood={mood}
      />
    </div>
  );
}
