import type { Metadata, Viewport } from 'next';

import BackgroundGate from '@/components/BackgroundGate';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { tgLink } from '@/lib/tg';
import { env, GATE_ON } from '@/lib/env';

import c from './page.module.css';

/**
 * Variant 9 — «Banknota».
 *
 * MANBA: `budget2` loyihasidagi ayni kadr (commit 213f2f7 — mobil tartib
 * to'g'irlangan holati). Razmetka va o'lchamlar asl holida ko'chirildi;
 * o'zgargani faqat ULANISHLAR, chunki ikki loyihaning kutubxonalari boshqa:
 *
 *   budget2                          bu yerda
 *   ─────────────────────────        ─────────────────────────
 *   TurnstileGuard                   BackgroundGate
 *   MetaPixel ids={pagePixels(…)}    MetaPixel path="/9"
 *   pageAt('/9') → lib/pages         lib/landings.ts
 *   <style>body{background:…}</style> `doc-night` klassi (globals.css)
 *   data-t-id="pul"                  data-t-id="v9_vote"
 *
 * Oxirgisi ataylab: admin paneldagi «Sahifa × tugma» jadvalida tugma
 * nomlari `v2_vote`, `v3_vote` … tarzida terilgan. `pul` deb qoldirilsa u
 * o'sha ro'yxatda yolg'iz, tushunarsiz qator bo'lib turardi.
 *
 * Kadrda taymer YO'Q — manbada ham yo'q edi. `/2`–`/8` dagi taymer bu
 * kompozitsiyaga qo'shilsa, bitta ekranga sig'ish sharti buzilardi.
 *
 * Sahifa to'liq statik (SSG).
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Har bir ovoz uchun to‘lov',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0c0e12',
  colorScheme: 'dark',
};

export default async function VariantBanknota() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');

  return (
    <div className={`${c.screen} doc-night`}>
      {/* Pastdagi qizil nur — kreativdagi tugma atrofidagi yog'du */}
      <div className={c.glow} aria-hidden />

      <div className={c.wrap}>
        <header className={c.head}>
          <span className={c.mark}>
            <Logo size={30} className="" />
          </span>
          <span className={c.brand}>Milliy Jamoasi</span>
        </header>

        <div className={c.mid}>
          <img
            src="/banknota-100k.webp"
            alt=""
            width={880}
            height={470}
            fetchPriority="high"
            decoding="async"
            className={c.note100}
          />

          <h1 className={c.title}>
            Har bitta ovoz uchun
            <br />
            <b className={c.hl}>100 000 so‘m</b> gacha!
          </h1>

          <p className={c.sub}>Faqat biz har bir ovoz uchun haqiqiy to‘lov qilamiz.</p>
        </div>

        <div className={c.cta}>
          <a href={tg} className={c.btn} data-t="cta" data-t-id="v9_vote" data-tg rel="noopener">
            <Telegram size={20} />
            Pul ishlash
            <span className={c.arrow} aria-hidden>
              →
            </span>
          </a>
          <p className={c.note}>To‘lovlar Telegram bot orqali amalga oshiriladi</p>
        </div>
      </div>

      <MetaPixel path="/9" />
      <Tracker />

      {/* Fonda ishlaydigan Turnstile — sahifani to'smaydi, odatda ko'rinmaydi */}
      <BackgroundGate siteKey={GATE_ON ? env.TURNSTILE_SITE_KEY : ''} />
    </div>
  );
}
