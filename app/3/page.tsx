import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import AdSwitcher from '@/components/landing/AdSwitcher';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { PAYOUT } from '@/lib/payout';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * Variant 3 — «Karta» (dizayn kanvasidagi 14-ekran).
 *
 * Mukofot matn emas, BUYUM: studiya yorug'ligidagi bank kartasi va uning
 * ustiga tushayotgan to'lov. Katta sarlavha ataylab yo'q — kadrning
 * markazi kartaning o'zi.
 *
 * MANBADAN FARQ — bitta joyda. Kanvasda karta ostida «Oxirgi to'lov:
 * 2 daqiqa oldin · Humo •• 4211» qatori bor edi: bu aniq, tekshirib
 * bo'lmaydigan va sodir bo'lmagan hodisani da'vo qiladi. Vizual element
 * (jonli nuqta + bitta qator) saqlandi, matn esa haqiqiy ma'lumotga
 * almashtirildi — foydalanuvchilar soni admin sozlamasidan keladi.
 *
 * Kartadagi «8600» — Uzcard raqamlarining OCHIQ prefiksi (barcha Uzcard
 * shu bilan boshlanadi), ya'ni birovning kartasi emas, kartaning turi.
 *
 * Sahifa to'liq statik (SSG); yagona client kod — Tracker.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

/** Ekran to'q — brauzer paneli ham to'q bo'lsin */
export const viewport: Viewport = {
  themeColor: '#080d14',
  colorScheme: 'dark',
};

export default async function VariantKarta() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');

  return (
    <div className={`${a.screen} ${c.page} doc-navy`}>
      <div className={c.bg} aria-hidden />

      <div className={a.wrap}>
        <header className={a.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={22} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>Ovoz → pul</span>
        </header>

        <div className={a.mid}>
          <div className={c.stage}>
            <span className={c.drop} aria-hidden>
              +{PAYOUT} so‘m
            </span>

            <div className={c.card}>
              <div className={c.cTop}>
                <span className={c.cBrand}>{SITE.brand}</span>
                <span className={c.cChip} aria-hidden />
              </div>

              <div>
                <p className={`${c.cAmt} tnum`}>
                  {PAYOUT}
                  <span>so‘m</span>
                </p>
                <p className={c.cLab}>har bir ovoz uchun</p>
              </div>

              <div className={c.cBot}>
                <span className={c.cNum}>
                  <i>●●●●</i> <i>●●●●</i> <i>●●●●</i> 8600
                </span>
                <span className={c.cNet}>UZCARD</span>
              </div>
            </div>

            <span className={c.shadow} aria-hidden />
          </div>

          <h1 className={c.title}>
            Pul to‘g‘ri <b>kartangizga</b> tushadi
          </h1>
          <p className={c.sub}>
            Hamyon ham, ilova ham kerak emas. Uzcard yoki Humo raqamini kiritasiz — qolganini
            bot qiladi.
          </p>
          <p className={c.last}>
            <span className={c.pulse} aria-hidden />
            {s.reviews_count} foydalanuvchi allaqachon to‘lov oldi
          </p>
        </div>

        {/* Ikkala tugma ham bitta botga olib boradi — qaysi biri
            bosilganini analitika `data-t-id` orqali ajratadi */}
        <div className={a.cta}>
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v3_vote"
            data-tg
            rel="noopener"
          >
            Ovoz berish
          </a>
          <a
            href={tg}
            className={`${a.btn} ${c.ghost}`}
            data-t="cta"
            data-t-id="v3_payout"
            data-tg
            rel="noopener"
          >
            Pulni olish
          </a>
          <p className={`${a.note} ${c.note}`}>Komissiyasiz · 2 daqiqada</p>
        </div>
      </div>

      <AdSwitcher current="3" />
      <Tracker />
    </div>
  );
}
