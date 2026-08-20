import { Archivo, Inter } from 'next/font/google';

/**
 * Variant 7 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga (jumladan `/l` va asosiy landing'ga)
 * preload bo'lib tushardi. Bu ikkisi faqat `/7` so'ralganda yuklanadi.
 *
 * `/6` bilan bir xil juftlik — ikkala plakat ekrani bitta tilda gapiradi:
 *   Archivo — narx (`wdth` o'qi: yorliq keng, raqam tor)
 *   Inter   — izoh, tugma, pastki qator
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--f7-body',
  display: 'swap',
});

const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--f7-display',
  display: 'swap',
});

export default function VariantSevenLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
