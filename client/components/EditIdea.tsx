import { personaConfig } from '@/config/persona.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MAX_LENGTH = 20;

const EditIdea = ({
  onClose,
  value,
  onChange,
}: {
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);

  const save = () => {
    onChange(localValue.trim().slice(0, MAX_LENGTH));
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      save();
    }
  };

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute top-0 left-0 w-full h-full bg-[#171D21] text-white flex flex-col items-center justify-center gap-2 md:gap-4 font-inter"
      >
        <h1 className="text-xl md:text-2xl font-mono text-[#00FF41] translate-y-[-9px] translate-x-[1px]">
          {personaConfig.shareFrame.prompt}
        </h1>

        <div className="max-w-[80%] flex flex-col gap-2 -translate-x-[2px] relative">
          <input
            type="text"
            className="w-full bg-transparent text-white !text-3xl md:!text-5xl border-b-2 border-[#00FF41] text-center focus:outline-none hover:outline-none -mt-1 mx-auto font-inter"
            placeholder="Your Idea name"
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
          />
        </div>

        <div className="flex gap-3 font-inter mt-4">
          <button
            className="bg-transparent text-white/70 hover:text-white px-4 py-2 min-w-24 font-medium transition-colors"
            onClick={onClose}
          >
            Discard
          </button>
          <button
            className="bg-[#16A34A] text-white px-4 py-2 min-w-24 font-medium hover:bg-[#15803D] transition-colors"
            onClick={save}
          >
            Save
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditIdea;
