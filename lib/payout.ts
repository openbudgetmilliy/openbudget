import { uzs } from './content';

/**
 * Bir ovoz uchun foydalanuvchiga TO'LANADIGAN summa.
 *
 * Bu `price_one_vote` (admin sozlamasi) EMAS — u ovozning sotuv narxi va
 * `/1`, `/6` kabi to'liq landing'larda «1 ovoz narxi» sifatida ko'rsatiladi.
 * Reklama ekranlari esa boshqa gapni aytadi: odam nima OLADI.
 *
 * DIQQAT — bu raqam ikki joyda RASM bilan bog'langan:
 *   `/`   — asosiy sahifadagi 20 000 so'mlik banknota (`yigirma-ming.webp`)
 *   `/5`  — daftar varag'idagi «chek»
 * Summa o'zgarsa banknota rasmi ham almashtirilishi shart, aks holda matn
 * va rasm bir-birini yolg'onga chiqaradi. Shuning uchun u admin panelidan
 * emas, shu yerdan — o'zgartirish ongli qaror bo'lsin.
 */
export const PAYOUT_UZS = 20000;

/** «20 000» — guruhlangan ko'rinish, matnda shu ishlatiladi */
export const PAYOUT = uzs(PAYOUT_UZS);

/**
 * Hisoblagich uchun tayyor qadamlar (`/4`).
 *
 * JavaScript yo'q: to'rt holat ham HTML'da oldindan chizilib, `:checked`
 * bilan almashtiriladi. Shu sabab summalar shu yerda — bir marta, server
 * tomonda hisoblanadi.
 */
export const PAYOUT_STEPS = [1, 3, 5, 10].map((votes) => ({
  votes,
  sum: uzs(votes * PAYOUT_UZS),
}));
