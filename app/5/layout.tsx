import { Caveat, Inter } from 'next/font/google';

/**
 * Variant 5 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga preload bo'lib tushardi.
 *
 * `Caveat` — qo'l yozuvi. U FAQAT gapirayotgan ovozga tegishli (sarlavha,
 * ro'yxat, izoh); raqamlar va tugmalar bosma shriftda qoladi, aks holda
 * o'qish qiyinlashadi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--f5-body',
  display: 'swap',
});

const hand = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f5-hand',
  display: 'swap',
});

export default function VariantFiveLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${hand.variable}`}>{children}</div>;
}
