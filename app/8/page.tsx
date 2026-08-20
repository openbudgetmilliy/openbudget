import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import MetaPixel from '@/components/MetaPixel';

import Countdown from '@/components/landing/Countdown';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { CAMPAIGN, campaignLeft, deadlineLabel } from '@/lib/campaign';
import { liveStats } from '@/lib/landing-sections';
import { SITE } from '@/lib/content';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import c from './page.module.css';

/**
 * Variant 8 — «Neon».
 *
 * Yondashuv: BITTA GAP, IKKI EKRAN. Bo'lim yo'q, menyu yo'q, FAQ yo'q —
 * sarlavha, tugma va bitta karta. Sovuq trafik uchun qisqa kadr: o'qish
 * kam bo'lsa, tugmagacha yo'l ham qisqa.
 *
 * Bu variant ilgari to'liq landing edi (header, ticker, qadamlar, mukofot,
 * savol-javob, futer — 1400 qatordan ortiq) va `/1` bilan bir xil gapni
 * aytardi. Endi u boshqa gipotezani sinaydi: uzun landing kerakmi yoki
 * bitta ekran yetadimi.
 *
 * MATN AKSIYAGA BOG'LANGAN, sozlamalarga emas. Qolgan variantlar bir ovoz
 * narxini (`price_one_vote`) ko'rsatadi; bu sahifa esa aksiyaning yuqori
 * chegarasini va sovrinni aytadi. Ikkalasi boshqa gap, shuning uchun matn
 * `lib/campaign.ts` da — sakkizta sahifa uchun bitta manba.
 *
 * Sahifada Tracker'dan tashqari YANA BITTA client element bor — taymer
 * (`Countdown.tsx`). Landing'lar orasida yagona istisno; sababi shuki,
 * qolgan vaqtni serverda hisoblab bo'lmaydi (sahifa keshdan keladi).
 *
 * Sahifa baribir statik (SSG) bo'lib qoladi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: `Ovoz bering va ${CAMPAIGN.ceiling} pul oling`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#05060c',
  colorScheme: 'dark',
};

/** Tugmadagi strelka — matn rangini `currentColor` orqali oladi */
function Arrow() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={c.arrow}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function VariantNeon() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');

  /* Server tomonidagi boshlang'ich qiymat — client'ning birinchi renderi
     ham aynan shuni ishlatadi, ya'ni hydration mos keladi */
  const left = campaignLeft();
  const open = left > 0;
  const stats = liveStats(s);

  const cta = (id: string) => (
    <a href={tg} className={c.cta} data-t="cta" data-t-id={id} data-tg rel="noopener">
      Ovoz berish
      <Arrow />
    </a>
  );

  return (
    <div className={`${c.page} doc-neon`}>
      {/* Fon: tepada ko'k-moviy, karta atrofida siyoh-binafsha yog'du.
          Alohida qatlam — matn ustiga tushmasin. */}
      <div className={c.sky} aria-hidden />

      <main className={c.wrap}>
        <header className={c.head}>
          <div className={c.brandRow}>
            <span className={c.mark}>
              <Logo size={28} className={c.markImg} />
            </span>
            <span className={c.brand}>{SITE.brand}</span>
          </div>

          <h1 className={c.title}>
            Ovoz bering va <span className={c.grad}>{CAMPAIGN.ceiling}</span> pul oling
          </h1>

          <p className={c.sub}>
            Open Budgetga ovoz berib {CAMPAIGN.ceiling} pul oling. Undan tashqari{' '}
            {CAMPAIGN.prize} g‘olibiga ham aylanishingiz mumkin.
          </p>
        </header>

        {cta('v8_hero')}

        <p className={c.micro}>Ishtirok butunlay bepul · Ovoz berish 30 soniya</p>

        {open ? (
          <section className={c.card} aria-label="Ovoz berish muddati">
            <h2 className={c.h2}>Ovozingizni hoziroq bering</h2>

            <Countdown
              initial={left}
              lead=""
              classes={{ grid: `${c.tiles} ${c.tiles4}`, cell: c.tile, num: `${c.tileNum} ${c.grad}`, lab: c.tileLab }}
            />

            {cta('v8_card')}

            <p className={c.micro}>100% bepul · Muddat {deadlineLabel()} da tugaydi.</p>
          </section>
        ) : (
          /* Muddat o'tgan: taymer o'rniga ko'rsatkichlar. Nol turgan taymer
             «aksiya tugagan» degan xabar bo'lardi va reklama trafigini
             bekorga yoqib yuborardi. */
          <section className={c.card} aria-label="Ko‘rsatkichlar">
            <h2 className={c.h2}>Hozirgacha qanday ketyapti</h2>
            <p className={c.cardSub}>Loyiha bo‘yicha joriy ko‘rsatkichlar:</p>

            <ul className={c.tiles}>
              {stats.map((it) => (
                <li key={it.lab} className={c.tile}>
                  <span className={`${c.tileNum} ${c.grad}`}>{it.num}</span>
                  <span className={c.tileLab}>{it.lab}</span>
                </li>
              ))}
            </ul>

            {cta('v8_card')}

            <p className={c.micro}>Komissiyasiz · Uzcard va Humo · @{bot}</p>
          </section>
        )}
      </main>

      <MetaPixel path="/8" />

      <Tracker />
    </div>
  );
}
