import 'server-only';

import { prisma } from './prisma';
import { LANDINGS } from './landings';
import { tgLink } from './tg';
import { env } from './env';

/**
 * HAR SAHIFA UCHUN ALOHIDA BOT HAVOLASI.
 *
 * Sabab — `?start=` tamg'asi. Sozlamadagi umumiy havolaga bir marta
 * `?start=dilnura` yozilsa, u TO'QQIZALA sahifada bir xil bo'lib qoladi va
 * bot kimning qayerdan kelganini ajrata olmaydi: `/3` dan kelgan ham,
 * `/9` dan kelgan ham bir xil ko'rinadi.
 *
 * Endi har kadr o'z havolasini olishi mumkin: `bot_v3`, `bot_v9` … Bo'sh
 * qoldirilsa umumiy `bot_username` ishlaydi, ya'ni hech narsa buzilmaydi.
 *
 * QIYMAT FORMATI — `lib/tg.ts` nimani tushunsa, shuni:
 *   `bot`, `@bot`, `t.me/bot`, `https://t.me/bot?start=v3` …
 * Havolada `start` bo'lsa u saqlanadi; bo'lmasa sahifaning slug'i qo'yiladi
 * (`/3` → `?start=v3`), shunda bot manba haqida baribir xabardor bo'ladi.
 */

/** Landing yo'li → sozlama kaliti (`/3` → `bot_v3`) */
export function botKey(path: string): string | null {
  const l = LANDINGS.find((x) => x.path === path);
  return l ? `bot_${l.slug}` : null;
}

/** Barcha sahifa havolalari — admin formasi uchun (bo'shlari ham) */
export async function allBotLinks(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const l of LANDINGS) out[`bot_${l.slug}`] = '';
  if (!env.DATABASE_URL) return out;
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: 'bot_' } } });
    // `bot_username` ham shu prefiks bilan boshlanadi — u umumiy sozlama,
    // sahifa havolasi emas, shuning uchun ro'yxatga tushmaydi
    for (const r of rows) if (r.key in out) out[r.key] = r.value;
  } catch {
    /* baza yo'q — bo'sh qiymatlar, sahifa baribir ochiladi */
  }
  return out;
}

/**
 * Shu sahifaning tugmalari ketadigan manzil.
 *
 * Tartib: sahifa sozlamasi → umumiy `bot_username` → `env.BOT`.
 * Sahifa sozlamasida `start` bo'lmasa, slug qo'yiladi.
 */
export async function botLinkFor(path: string, fallback: string): Promise<string> {
  const key = botKey(path);
  const slug = LANDINGS.find((x) => x.path === path)?.slug ?? 'web';

  if (key && env.DATABASE_URL) {
    try {
      const row = await prisma.setting.findUnique({ where: { key } });
      const v = (row?.value ?? '').trim();
      if (v) return tgLink(v, slug);
    } catch {
      /* baza yo'q — umumiy havolaga tushamiz */
    }
  }

  return tgLink(fallback || env.BOT, 'web');
}
