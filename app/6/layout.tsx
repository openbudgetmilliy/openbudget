import { Caveat, Inter } from 'next/font/google';

/**
 * Variant 6 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga preload bo'lib tushardi.
 *
 * Ikkitasi, ikki vazifa:
 *   Caveat — rasm ustiga qo'lda yozilgan narx (faqat shu ikki qator)
 *   Inter  — tugma va uning ostidagi izoh; ular bosma bo'lib qolishi kerak,
 *            aks holda «bosiladigan narsa» ekani yo'qoladi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--f6-body',
  display: 'swap',
});

const hand = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--f6-hand',
  display: 'swap',
});

export default function VariantSixLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${hand.variable}`}>{children}</div>;
}
