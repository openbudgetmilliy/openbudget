import Aurora from '@/components/landing/Aurora';
import BackgroundGate from '@/components/BackgroundGate';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { env, GATE_ON } from '@/lib/env';

/**
 * Asosiy sahifa — domen ochilganda ko'rinadigan landing.
 *
 * Ilgari bu yerda kirish darvozasi turardi: odam Turnstile tekshiruvini
 * kutar, keyin `/l` ga o'tkazilardi. Endi kontent DARHOL ochiladi, tekshiruv
 * esa `BackgroundGate` orqali sahifa ortida ishlaydi.
 *
 * Nega o'zgardi: darvoza har bir mehmonga bir necha soniya kutish va bitta
 * qo'shimcha yo'naltirish qo'shardi — reklamadan kelgan trafikda bu eng
 * qimmat joy. Tekshiruvning o'zi (`/api/gate`, rate-limit, `gt` cookie)
 * saqlanib qoldi, faqat u endi kirishni to'smaydi.
 *
 * Razmetka `components/landing/Aurora.tsx` da — `/3` bilan bitta manba.
 *
 * To'liq statik (SSG): Cloudflare edge'da cache'lanadi, narx o'zgarganda
 * `lib/cf.ts` uni purge qiladi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

export default async function Home() {
  const s = await getSettings();

  return (
    <>
      <Aurora s={s} prefix="main" />

      {/* Kalitlar qo'yilmagan bo'lsa (`GATE_ON` false) — umuman chiqmaydi */}
      <BackgroundGate siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} />

      {/* Strukturali ma'lumot — statik HTML ichida, qo'shimcha so'rovsiz */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE.brand,
            url: env.SITE_URL,
            description: SITE.description,
            sameAs: [`https://t.me/${s.tg_channel}`],
          }),
        }}
      />
    </>
  );
}
