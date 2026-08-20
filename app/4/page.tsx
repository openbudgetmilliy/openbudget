import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import Logo from '@/components/Logo';
import AdSwitcher from '@/components/landing/AdSwitcher';

import { getSettings } from '@/lib/data';
import { SITE } from '@/lib/content';
import { PAYOUT, PAYOUT_STEPS } from '@/lib/payout';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * Variant 4 — «Hisob» (dizayn kanvasidagi 15-ekran).
 *
 * Biz raqam aytmaymiz — odam o'zi hisoblaydi: nechta ovoz tanlasa, shuncha
 * summani darhol ko'radi. Bosgan odam allaqachon «10 ta ovoz = 200 000»
 * deb o'ylab qo'ygan bo'ladi.
 *
 * YAGONA INTERAKTIV VARIANT, JAVASCRIPT'SIZ. To'rt holat ham HTML'da
 * oldindan chizilgan; qaysi biri ko'rinishini radio tugma va CSS'dagi
 * `:checked ~` hal qiladi. Shuning uchun sahifa hech qanday client kod
 * talab qilmaydi va `force-static` bo'lib qolaveradi.
 *
 * Nega `defaultChecked` (`checked` emas): React'da `checked` propi
 * `onChange`siz boshqariladigan maydon deb qaraladi va foydalanuvchi
 * tanlovini bloklardi. `defaultChecked` esa HTML'ga `checked` atributini
 * yozadi-yu, keyin brauzerga to'liq erkinlik beradi.
 *
 * Summalar `lib/payout.ts` da bir marta hisoblanadi — asosiy sahifa bilan
 * bitta manba.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#f4f2ec',
  colorScheme: 'light',
};

export default async function VariantHisob() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');

  return (
    <div className={`${a.screen} ${c.page} doc-paper`}>
      <div className={c.bg} aria-hidden />

      <div className={a.wrap}>
        {/* Radiolar `.mid` DAN OLDIN turishi shart — CSS ularni
            umumiy-birodar (`~`) selektori bilan topadi */}
        {PAYOUT_STEPS.map((step, i) => (
          <input
            key={step.votes}
            className={c.r}
            type="radio"
            name="hisob"
            id={`hisob-${i}`}
            defaultChecked={i === 0}
            aria-label={`${step.votes} ta ovoz`}
          />
        ))}

        <header className={a.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={21} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>Hisoblagich</span>
        </header>

        <div className={`${a.mid} ${c.mid}`}>
          <p className={c.lab}>Siz olasiz</p>

          <p className={c.disp}>
            {PAYOUT_STEPS.map((step, i) => (
              <span key={step.votes} className={`${c.num} ${c[`n${i}`]}`}>
                {step.sum}
              </span>
            ))}
            <span className={c.cur}>so‘m</span>
          </p>

          <p className={c.calc}>
            <b>
              {PAYOUT_STEPS.map((step, i) => (
                <span key={step.votes} className={`${c.cnt} ${c[`c${i}`]}`}>
                  {step.votes}
                </span>
              ))}{' '}
              ta ovoz
            </b>{' '}
            × {PAYOUT} so‘m
          </p>

          <div className={c.bar} aria-hidden>
            <i />
          </div>

          <p className={c.hint}>Nechta ovoz berasiz?</p>
          <div className={c.seg}>
            {PAYOUT_STEPS.map((step, i) => (
              <label key={step.votes} htmlFor={`hisob-${i}`} className={c[`seg${i}`]}>
                {step.votes}
                <small>ovoz</small>
              </label>
            ))}
          </div>

          <ul className={c.facts}>
            <li>
              Bitta ovozga ketadigan vaqt <b>2 daqiqa</b>
            </li>
            <li>
              Komissiya va xizmat haqi <b>0 so‘m</b>
            </li>
            <li>
              Kerak bo‘ladigan hujjat <b>0 ta</b>
            </li>
          </ul>
        </div>

        {/* Ikkala tugma ham bitta botga olib boradi — qaysi biri
            bosilganini analitika `data-t-id` orqali ajratadi */}
        <div className={a.cta}>
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v4_vote"
            data-tg
            rel="noopener"
          >
            Ovoz berish
          </a>
          <a
            href={tg}
            className={`${a.btn} ${c.ghost}`}
            data-t="cta"
            data-t-id="v4_payout"
            data-tg
            rel="noopener"
          >
            Pulni olish
          </a>
          <p className={`${a.note} ${c.note}`}>To‘lov Uzcard yoki Humo kartaga tushadi</p>
        </div>
      </div>

      <AdSwitcher current="4" />
      <Tracker />
    </div>
  );
}
