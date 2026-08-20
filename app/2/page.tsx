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
 * Variant 2 — «Moviy» (dizayn kanvasidagi 11-ekran).
 *
 * Instagram stories tili, logotip ranglarida: to'liq ekranli moviy
 * gradient, oq stiker ichidagi raqam. Bitta ekran, skrollsiz — reklama
 * bosgan odam uchun bitta qaror.
 *
 * Nima qayerdan keladi:
 *   summa    — `lib/payout.ts` → `price_one_vote` sozlamasi (bitta manba)
 *   bot      — `tgLink()`, admin sozlamasidagi `bot_username`
 *   sarlavha — SHU VARIANTGA XOS. A/B sinovining ma'nosi shunda: matn ham
 *              dizayn bilan birga sinaladi, shuning uchun u sozlamadan
 *              olinmaydi.
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

/** Ekran moviy — brauzer paneli ham shu rangda bo'lsin */
export const viewport: Viewport = {
  themeColor: '#0090d8',
  colorScheme: 'dark',
};

export default async function VariantMoviy() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const left = campaignLeft();
  const open = isOpen();

  return (
    <div className={`${a.screen} ${c.page} doc-blue`}>
      <div className={c.bg} aria-hidden />

      <div className={a.wrap}>
        <header className={a.head}>
          <div className={c.brand}>
            <span className={c.mark}>
              <Logo size={26} className={c.markImg} />
            </span>
            {SITE.brand}
          </div>
          <span className={c.tag}>Bugun ochiq</span>
        </header>

        <div className={a.mid}>
          <h1 className={c.title}>
            Bitta ovoz.
            <br />
            Naqd mukofot.
          </h1>
          <p className={c.sub}>
            Ochiq byudjet loyihasiga ovoz bering — pul kartangizga o‘sha kuni tushadi.
          </p>

          <div className={c.sticker}>
            <p className={c.sNum}>{price(s)}</p>
            <p className={c.sLab}>so‘m / har bir ovoz</p>
          </div>

          <div className={c.row}>
            <span className={c.pill}>2 daqiqa</span>
            <span className={c.pill}>Uzcard / Humo</span>
            <span className={c.pill}>Bepul</span>
          </div>
        </div>

        {/* Ikkala tugma ham bitta botga olib boradi — qaysi biri
            bosilganini analitika `data-t-id` orqali ajratadi */}
        <div className={a.cta}>
          {open ? (
            <Countdown
              initial={left}
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
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v2_vote"
            data-tg
            rel="noopener"
          >
            Ovoz berish
          </a>
          <p className={`${a.note} ${c.note}`}>
            Ro‘yxatdan o‘tish shart emas — Telegram yetarli
          </p>
        </div>
      </div>

      <MetaPixel path="/2" />

      <Tracker />
    </div>
  );
}
