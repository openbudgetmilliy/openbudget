import { Archivo, Inter } from 'next/font/google';

/**
 * Variant 6 shriftlari — ATAYIN shu marshrutda, `app/fonts.ts` da emas:
 * u yerdagi oila BARCHA sahifalarga preload bo'lib tushardi.
 *
 * Ikkitasi, ikki vazifa:
 *   Archivo — narx. `wdth` o'qi bilan: yorliq keng (108%), raqam tor (88%).
 *             Bitta oila ichidagi shu qarama-qarshilik plakat tipografikasi
 *             — `app/fonts.ts` dagi izohda batafsil.
 *   Inter   — tugma va uning ostidagi izoh.
 *
 * Avval narx Caveat (qo'l yozuvi) edi; plakatning o'z sarlavhasi bosma
 * bo'lgani uchun bosma shriftga o'tkazildi.
 */
const body = Inter({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--f6-body',
  display: 'swap',
});

const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--f6-display',
  display: 'swap',
});

export default function VariantSixLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${body.variable} ${display.variable}`}>{children}</div>;
}
