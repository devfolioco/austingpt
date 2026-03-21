import { Inconsolata, Inter } from 'next/font/google';
import localFont from 'next/font/local';

export const nyghtRegular = localFont({
  src: '../fonts/NyghtSerif-Regular.ttf',
  display: 'swap',
});

export const nyghtBold = localFont({
  src: '../fonts/NyghtSerif-Bold.ttf',
  display: 'swap',
});

export const nyghtMedium = localFont({
  src: '../fonts/NyghtSerif-Medium.ttf',
  display: 'swap',
});

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const inconsolata = Inconsolata({ subsets: ['latin'], variable: '--font-inconsolata' });

export const drukCondSuper = localFont({
  src: '../fonts/DrukCond-Super.woff2',
  display: 'swap',
});
