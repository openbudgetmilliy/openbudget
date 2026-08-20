import { Montserrat, Playfair_Display } from 'next/font/google';

/**
 * Variant 5 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga preload bo'lib tushardi.
 *
 * Kadrning butun kuchi IKKI SHRIFT QARAMA-QARSHILIGIDA:
 *
 *   Montserrat 800  — geometrik, og'ir, keng. Sarlavha, stiker va tugma
 *                     shunda: baqiradigan ovoz.
 *   Playfair 800    — yuqori kontrastli serif. FAQAT oq kartochka ichida:
 *                     u yerda ovoz o'zgaradi, «e'lon» dan «ko'rsatma» ga
 *                     o'tadi. Ikkinchi shriftsiz kartochka shunchaki
 *                     kichikroq sarlavhaga o'xshab qolardi.
 */
const display = Montserrat({
  subsets: ['latin'],
  weight: ['700', '800'],
  style: ['normal', 'italic'],
  variable: '--f5-display',
  display: 'swap',
});

const serif = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--f5-serif',
  display: 'swap',
});

export default function VariantFiveLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${serif.variable}`}>{children}</div>;
}
