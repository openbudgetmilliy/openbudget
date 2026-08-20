import 'server-only';
import { revalidatePath } from 'next/cache';
import { LANDING_PATHS } from './landings';
import { env } from './env';

/**
 * Narx o'zgarganda ikki qatlamli cache'ni tozalash.
 *
 *   1) Next ISR (disk) — `revalidatePath('/')`
 *   2) Cloudflare edge — URL bo'yicha purge
 *
 * MUHIM (PM2 cluster, 2 instance): Next'ning in-memory ISR keshi o'chirilgan
 * (`cacheMaxMemorySize: 0`), shuning uchun revalidate diskka yoziladi va
 * ikkinchi instance ham darhol yangi HTML'ni ko'radi. Aks holda bir instance
 * eski narxni ko'rsatib turardi.
 */

export async function purgeCloudflare(urls: string[]): Promise<boolean> {
  if (!env.CF_ZONE_ID || !env.CF_API_TOKEN) return false;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      },
    );
    if (!res.ok) console.error('[cf] purge', res.status, await res.text().catch(() => ''));
    return res.ok;
  } catch (err) {
    console.error('[cf] purge', (err as Error).message);
    return false;
  }
}

/**
 * Landing'ni to'liq yangilash: ISR + CF edge.
 *
 * Narx BARCHA sahifalarda ko'rinadi — asosiy `/` da ham, `/l` da ham,
 * `/1`–`/9` A/B variantlarida ham. Hammasi bitta `getSettings()` manbasidan
 * o'qiydi, shuning uchun narx o'zgarganda hammasining ISR keshi bekor
 * qilinadi va CF edge'dan purge qilinadi.
 *
 * Ilgari bu yerda faqat `/l` va `/` bor edi: qolgan variantlar `revalidate:
 * 60` bilan bir daqiqada o'zini yangilardi. Endi asosiy sahifa ham shu
 * ro'yxatda va u DARHOL yangilanishi kerak — narx eski qolgan bosh sahifa
 * eng qimmatga tushadigan xato.
 */
// Ro'yxat `lib/landings.ts` da — admin paneldagi jadval bilan bitta manba


export async function refreshLanding(): Promise<{ isr: true; cf: boolean }> {
  for (const path of LANDING_PATHS) revalidatePath(path);

  // 404 sahifasidagi tugma ham sozlamadagi botga ketadi (`app/not-found.tsx`),
  // lekin u marshrut emas — Next uni `/_not-found` segmenti deb ataydi.
  // Usiz bot almashganda 404 eski manzilda qolib ketardi.
  revalidatePath('/_not-found');

  const cf = await purgeCloudflare([
    // Ildiz ikki ko'rinishda ham purge qilinadi — CF ularni alohida
    // kalit sifatida saqlashi mumkin
    `${env.SITE_URL}`,
    ...LANDING_PATHS.map((path) => `${env.SITE_URL}${path}`),
    `${env.SITE_URL}/sitemap.xml`,
  ]);
  return { isr: true, cf };
}
