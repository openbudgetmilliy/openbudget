import { Inter, Montserrat } from 'next/font/google';

/**
 * Variant 7 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga (jumladan `/l` va asosiy landing'ga)
 * preload bo'lib tushardi. Bu ikkisi faqat `/7` so'ralganda yuklanadi.
 *
 *   Montserrat — narx. Plakatning O'Z sarlavhasi («OPEN BUDJET BOSHLANDI»)
 *                geometrik, keng va yumaloq uchli; Montserrat shu qurilishga
 *                eng yaqin oila. Shu sabab narx rasmga yopishtirilgandek
 *                emas, uning davomidek o'qiladi.
 *   Inter      — izoh, tugma, pastki qator.
 *
 * `/6` da narx Archivo bilan teriladi — ikkalasi ikki xil plakat, ikki xil
 * ovoz: bu yerda geometrik va keng, u yerda grotesk va tor.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--f7-body',
  display: 'swap',
});

const display = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--f7-display',
  display: 'swap',
});

export default function VariantSevenLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
