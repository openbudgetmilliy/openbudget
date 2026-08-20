import { Inter } from 'next/font/google';

/**
 * Variant 4 shrifti — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga preload bo'lib tushardi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--f4-body',
  display: 'swap',
});

export default function VariantFourLayout({ children }: { children: React.ReactNode }) {
  return <div className={body.variable}>{children}</div>;
}
