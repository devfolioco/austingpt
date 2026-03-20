import { motion } from 'motion/react';
import { Loader } from './Loader';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';

const Snackbar = ({
  children,
  appearance = 'success',
}: {
  children: React.ReactNode;
  appearance?: 'error' | 'success' | 'loading';
}) => {
  const bgStyles = {
    success: 'bg-[#F0FDF4] border-[#16A34A]/20 text-[#15803D]',
    error: 'bg-[#FFF0F0] border-[#DC2626]/20 text-[#DC2626]',
    loading: 'bg-white border-[#E4EAEB] text-[#5C686D]',
  };

  return (
    <motion.div
      className={`flex gap-3 p-4 items-center self-stretch border rounded-lg absolute md:w-full bottom-4 md:bottom-auto md:top-full mt-4 left-0 font-inter text-sm md:text-base mx-4 md:mx-0 w-[calc(100%-32px)] shadow-sm ${bgStyles[appearance]}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      {appearance === 'error' ? <ErrorIcon /> : appearance === 'success' ? <CheckIcon /> : <Loader color="#5C686D" />}
      <p>{children}</p>
    </motion.div>
  );
};

export default Snackbar;
