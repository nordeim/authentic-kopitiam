import { Fraunces as FrauncesFont, DM_Sans as DMSansFont } from 'next/font/google';

export const Fraunces = FrauncesFont({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

export const DM_Sans = DMSansFont({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});
