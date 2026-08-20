import 'server-only';

import { prisma } from './prisma';
import { LANDINGS } from './landings';
import { env } from './env';

/**
 * HAR SAHIFA UCHUN ALOHIDA META PIXEL.
 *
 * Har bir landing alohida reklama qilinadi, ya'ni har biri o'z reklama
 * kabinetiga va o'z pixeliga tegishli bo'lishi mumkin. Pixel ID'lari
 * `Setting` jadvalida `pixel_<slug>` kaliti bilan turadi (`pixel_main`,
 * `pixel_v3` …) — ya'ni admin panelidan o'zgartiriladi, deploy talab
 * qilmaydi.
 *
 * SAYT BO'YICHA UMUMIY PIXEL ham qoladi: `NEXT_PUBLIC_META_PIXEL_ID`
 * (env). U BARCHA sahifada ishlaydi va sahifa pixeliga QO'SHILADI, uni
 * almashtirmaydi — shunda umumiy hisob ham, sahifa hisobi ham yig'iladi.
 * Meta bir sahifada bir necha pixelni rasman qo'llab-quvvatlaydi: bazaviy
 * `fbq` kodi bir marta, `init` esa har ID uchun alohida.
 *
 * O'ZGARISH QACHON KO'RINADI: sahifalar SSG va 60 soniyada bir qayta
 * chiziladi; sozlama saqlanganda `lib/cf.ts` keshni ham tozalaydi, ya'ni
 * yangi ID bir daqiqa ichida jonli sahifaga tushadi.
 */

/** Faqat 5–20 xonali raqam — Meta ID formati */
export function validPixel(id: string): boolean {
  return /^\d{5,20}$/.test(id.trim());
}

/** Landing yo'li → sozlama kaliti (`/3` → `pixel_v3`) */
export function pixelKey(path: string): string | null {
  const l = LANDINGS.find((x) => x.path === path);
  return l ? `pixel_${l.slug}` : null;
}

/** Barcha sahifa pixellari — admin formasi uchun */
export async function allPixels(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const l of LANDINGS) out[`pixel_${l.slug}`] = '';
  if (!env.DATABASE_URL) return out;
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: 'pixel_' } } });
    for (const r of rows) if (r.key in out) out[r.key] = r.value;
  } catch {
    /* baza yo'q — bo'sh qiymatlar qaytadi, sahifa baribir ochiladi */
  }
  return out;
}

/**
 * Shu sahifada ishlashi kerak bo'lgan pixel ID'lari.
 *
 * Tartib muhim emas — Meta har `init` ni alohida hisoblaydi. Takrorlanish
 * olib tashlanadi: umumiy pixel bilan sahifa pixeli bir xil bo'lsa, ID
 * ikki marta `init` qilinib, PageView ikki barobar sanalardi.
 */
export async function pixelsFor(path: string): Promise<string[]> {
  const ids = new Set<string>();

  for (const id of (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '').split(',')) {
    const t = id.trim();
    if (validPixel(t)) ids.add(t);
  }

  const key = pixelKey(path);
  if (key && env.DATABASE_URL) {
    try {
      const row = await prisma.setting.findUnique({ where: { key } });
      const t = (row?.value ?? '').trim();
      if (validPixel(t)) ids.add(t);
    } catch {
      /* baza yo'q — umumiy pixel bilan davom etamiz */
    }
  }

  return [...ids];
}
