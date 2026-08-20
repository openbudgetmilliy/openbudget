import type { Viewport } from 'next';

import Oltin from '@/components/landing/Oltin';
import MetaPixel from '@/components/MetaPixel';
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
 * Razmetka `components/landing/Oltin.tsx` da — dizayn kanvasidan («Oltin»
 * ekrani) ko'chirilgan bitta ekranli kompozitsiya. Undan oldin bu yerda
 * `Aurora` turardi; u `/3` da qoldi.
 *
 * To'liq statik (SSG): Cloudflare edge'da cache'lanadi, narx o'zgarganda
 * `lib/cf.ts` uni purge qiladi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/**
 * Sahifa to'q — brauzer paneli ham to'q bo'lsin.
 *
 * Root layout'dagi qiymat («oq», yorug' plakat uchun) faqat SHU marshrutda
 * almashadi; qolgan sahifalar (`/l`, `/1`–`/9`, admin) tegmaydi.
 */
export const viewport: Viewport = {
  themeColor: '#222c3f',
  colorScheme: 'dark',
};

export default async function Home() {
  const s = await getSettings();

  return (
    <>
      <Oltin s={s} />
      <MetaPixel path="/" />

      {/* Kalitlar qo'yilmagan bo'lsa (`GATE_ON` false) — umuman chiqmaydi */}
      {/* `corner="top"` — bu sahifa bitta ekran: pastda CTA tugmalari
          turadi, katakcha ularni yopib qo'ymasligi kerak */}
      <BackgroundGate siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} corner="top" />

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
