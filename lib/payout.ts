import { uzs } from './content';
import type { Settings } from './data';

/**
 * SAHIFALARDAGI NARX — YAGONA MANBA.
 *
 * Barcha landing sahifalari (`/`, `/1`–`/9`, `/l`) shu yerdan o'qiydi,
 * manba esa bitta: admin paneldagi `price_one_vote` sozlamasi. Kodda
 * raqam YO'Q — narx `/admin/settings` da o'zgartiriladi va keyingi
 * revalidate'da (60 s) hamma sahifada birdek o'zgaradi.
 *
 * Ilgari bu fayl `PAYOUT = 20000` konstantasini eksport qilardi va uni
 * `/2`–`/5` bilan asosiy sahifa ishlatardi, qolgan variantlar esa
 * sozlamadagi 30 000 ni. Ya'ni bitta reklama to'plamidagi sahifalar ikki
 * xil raqam ko'rsatardi va A/B natijalarini solishtirib bo'lmasdi.
 * Endi bitta raqam — hamma joyda.
 *
 * DIQQAT — raqam BITTA RASMGA bog'langan: asosiy sahifadagi banknota
 * (`public/yigirma-ming.webp`, 20 000 so'mlik). Sozlamada boshqa summa
 * qo'yilsa matn o'zgaradi, rasm esa yo'q — o'shanda manbani almashtirib
 * `npm run assets:home` ni qayta ishlatish kerak.
 */

/** Sozlamadagi qiymatni songa aylantiradi: «30 000», «30000», «30 000 so'm» → 30000 */
export function priceUzs(s: Settings): number {
  const digits = (s.price_one_vote || '').replace(/[^\d]/g, '');
  const n = Number(digits);
  // Bo'sh yoki buzilgan qiymat sahifani «0 so'm» qilib qo'ymasin
  return Number.isFinite(n) && n > 0 ? n : 30000;
}

/** Ekranga chiqadigan ko'rinish — har doim guruhlangan: «30 000» */
export function price(s: Settings): string {
  return uzs(priceUzs(s));
}

/**
 * `/4` hisoblagichi uchun tayyor qadamlar.
 *
 * JavaScript yo'q: to'rt holat ham HTML'da oldindan chizilib, `:checked`
 * bilan almashtiriladi. Shu sabab summalar server tomonda hisoblanadi.
 */
export function priceSteps(s: Settings): { votes: number; sum: string }[] {
  const one = priceUzs(s);
  return [1, 3, 5, 10].map((votes) => ({ votes, sum: uzs(votes * one) }));
}
