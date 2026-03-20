'use client';

import { Color } from '@/theme/colors';
import clsx from 'clsx';
import Link from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  target?: string;
  appearance?: 'primary' | 'secondary' | 'colored' | 'outlined';
  color?: Color;
  stretch?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ href, target, appearance = 'primary', className = '', children, stretch = false, disabled, ...props }, ref) => {
    const baseStyles = 'font-inter font-semibold transition-all';
    const variants = {
      primary: clsx(
        baseStyles,
        'px-12 md:px-14 py-4 rounded-none text-xl md:text-2xl shadow-md tracking-[0.15em] uppercase',
        'text-white bg-[#16A34A] hover:bg-[#15803D]'
      ),
      secondary: clsx(
        baseStyles,
        'px-12 md:px-14 py-4 rounded-none text-xl md:text-2xl shadow-md tracking-[0.15em] uppercase',
        'border-2 border-[#16A34A] text-[#16A34A] bg-transparent hover:bg-[#16A34A]/10'
      ),
      colored: clsx(
        baseStyles,
        'flex items-center justify-center gap-2 py-4 px-10 w-full rounded-lg !font-semibold text-lg md:!text-xl transition-opacity',
        stretch ? 'w-full' : 'max-w-fit',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
      ),
      outlined: clsx(
        baseStyles,
        'border-2 border-[#16A34A] text-[#16A34A] bg-transparent hover:bg-[#16A34A]/10 px-14 py-3 rounded-none text-lg md:text-xl shadow-md tracking-[0.1em] uppercase',
        stretch ? 'w-full' : 'max-w-fit',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
      ),
    };

    const combinedClassName = clsx(variants[appearance], className);

    if (href) {
      return (
        <Link href={href} target={target} className={combinedClassName}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClassName} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
