import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import MetaPixel from '@/components/MetaPixel';
import Countdown from '@/components/landing/Countdown';
import Logo from '@/components/Logo';

import { getSettings } from '@/lib/data';
import { campaignLeft, isOpen } from '@/lib/campaign';
import { SITE } from '@/lib/content';
import { price } from '@/lib/payout';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * Variant 5 — «Qo'lyozma» (dizayn kanvasidagi 16-ekran).
 *
 * Brend emas, odam: katak daftar varag'i, ruchka bilan yozilgan gap,
 * marker bilan aylantirilgan summa. Lentada eng kam «reklama»ga
 * o'xshaydigan kadr — shuning uchun ko'proq to'xtatadi.
 *
 * MANBADAN IKKI FARQ — ikkalasi ham bir sababdan:
 *
 *   1. Skotchlangan qog'ozda «Kechagi to'lov · UZCARD •• 8600 · 14:32»
 *      turardi — aniq vaqt va karta raqami bilan. Bu sodir bo'lmagan
 *      tranzaksiyani da'vo qiladi. Qog'oz saqlandi, mazmuni esa endi
 *      da'vo emas, TARIF: bir ovoz uchun qancha to'lanadi.
 *   2. «bugun 1 240 kishi oldi» — tekshirib bo'lmaydigan kunlik raqam.
 *      O'rniga admin sozlamasidagi haqiqiy foydalanuvchilar soni.
 *
 * Sana `new Date()` dan: sahifa har daqiqada qayta chiziladi
 * (`revalidate: 60`), shuning uchun u eskirib qolmaydi.
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

export const viewport: Viewport = {
  themeColor: '#fbfaf3',
  colorScheme: 'light',
};

/** Daftar chetidagi sana — «19/08» ko'rinishida */
function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Ro'yxatdagi tasdiq belgisi — qo'lda chizilgandek qalin va yumaloq */
function Tick() {
  return (
    <span className={c.tick} aria-hidden>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 13 6 6L21 5" />
      </svg>
    </span>
  );
}

export default async function VariantQolyozma() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const left = campaignLeft();
  const open = isOpen();

  return (
    <div className={`${a.screen} ${c.page} doc-note`}>
      <div className={c.bg} aria-hidden />
      <div className={c.marg} aria-hidden />

      <div className={a.wrap}>
        <header className={`${a.head} ${c.head}`}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={22} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.date}>{today()}</span>
        </header>

        <div className={a.mid}>
          <h1 className={c.title}>
            Ovoz ber —
            <br />
            <span className={c.ring}>
              {price(s)}
              <svg viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
                <path d="M186 16C160 5 96 2 46 9 10 14 4 34 22 46c24 15 102 17 152 8 17-3 24-11 15-20-8-8-38-13-80-13" />
              </svg>
            </span>{' '}
            so‘m ol
          </h1>

          <p className={c.sub}>
            Ochiq budjet loyihasiga ovoz berasiz — pul o‘sha kuni kartangizga tushadi. Boshqa
            hech narsa qilish shart emas.
          </p>

          <div className={c.taped}>
            <span className={`${c.tape} ${c.t1}`} aria-hidden />
            <span className={`${c.tape} ${c.t2}`} aria-hidden />
            <p className={c.tT}>Bir ovoz uchun</p>
            <p className={`${c.tN} tnum`}>+{price(s)} so‘m</p>
            <p className={c.tS}>Uzcard yoki Humo kartaga</p>
          </div>

          <ul className={c.list}>
            <li>
              <Tick /> 2 daqiqa vaqt ketadi
            </li>
            <li>
              <Tick /> hujjat kerak emas
            </li>
            <li>
              <Tick /> Uzcard ham, Humo ham
            </li>
          </ul>
        </div>

        {/* Ikkala tugma ham bitta botga olib boradi — qaysi biri
            bosilganini analitika `data-t-id` orqali ajratadi */}
        <div className={a.cta}>
          <svg className={c.arrow} viewBox="0 0 54 56" aria-hidden>
            <path d="M10 4c18 7 26 19 24 32-.7 5-2.6 9-5.6 12.5" />
            <path d="M20 37l8.5 13 12-8" />
          </svg>

          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v5_vote"
            data-tg
            rel="noopener"
          >
            Ovoz berish
          </a>
          <a
            href={tg}
            className={`${a.btn} ${c.ghost}`}
            data-t="cta"
            data-t-id="v5_payout"
            data-tg
            rel="noopener"
          >
            Pulni olish
          </a>
          <p className={`${a.note} ${c.note}`}>{s.reviews_count} kishi allaqachon oldi</p>
          {open ? (
            <Countdown
              initial={left}
              /* Sarlavhasiz va izohsiz: bitta ekranli kadrda har piksel
                 hisobda. Kataklar ostidagi kun/soat/daq/son yorlig'i vaqtni
                 o'zi tushuntiradi; aniq sana `/1` va `/6`–`/8` da qoladi. */
              lead=""

              classes={{
                root: c.cd,
                lead: c.cdLead,
                grid: c.cdGrid,
                cell: c.cdCell,
                num: c.cdNum,
                lab: c.cdLab,
                note: c.cdNote,
              }}
            />
          ) : null}
        </div>
      </div>

      <MetaPixel path="/5" />

      <Tracker />
    </div>
  );
}
