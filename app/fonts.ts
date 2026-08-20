import { Archivo } from 'next/font/google';

/**
 * Plakat tipografikasi — Archivo, `wdth` o'qi bilan.
 *
 * Archivo o'zgaruvchan shrift: kenglik 62% dan 125% gacha, og'irlik 100–900.
 * Sarlavha 62% kenglik + 900 og'irlikda teriladi — bu ko'chadagi plakat
 * harflari: tor, qalin, baland. Shu bitta oiladan asosiy matn ham olinadi
 * (100% kenglik, 400), ya'ni ikkinchi shrift fayli yuklanmaydi.
 *
 * Nega Anton emas: Anton aynan shu ko'rinish uchun eng ko'p ishlatiladigan
 * shrift va bitta og'irligi bor. `wdth` o'qi esa kenglikni qo'lda boshqarish
 * imkonini beradi — sarlavha tor, yorliqlar keng bo'lib, bitta oila ichida
 * qarama-qarshilik hosil qiladi.
 */
export const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
  display: 'swap',
  /**
   * PRELOAD YO'Q — ATAYIN.
   *
   * `fontVars` root layout'da <html> ga qo'yiladi, ya'ni preload BARCHA
   * marshrutlarga tushardi. Asosiy sahifa («Oltin» ekrani) esa Archivo'ni
   * umuman ishlatmaydi — Manrope bilan yashaydi. Reklama trafigi aynan
   * o'sha sahifaga tushadi va u 90 KB lik keraksiz shriftni birinchi
   * navbatda yuklab olardi (LCP rasmi bilan bir vaqtda!).
   *
   * Preloadsiz shrift umuman so'ralmaydi — sahifada uni ishlatadigan matn
   * bo'lmasa. Archivo ishlatadigan sahifalar (`/l`, `/1`, `/2`, `/3`, `/4`,
   * `/5`) uni CSS qo'llangan zahoti so'raydi: bir necha millisekund
   * kechroq, lekin o'sha sahifalar A/B taqqoslash uchun.
   */
  preload: false,
});

export const fontVars = display.variable;
