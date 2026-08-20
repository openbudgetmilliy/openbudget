import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * Variant 6 — «Plakat».
 *
 * Tuzilishi `/5` bilan bir xil (bitta ekran, skrollsiz, umumiy skelet), lekin
 * kadrni CSS emas, TAYYOR RASM yasaydi: `public/pul-sumkasi.webp` — pul
 * solingan yashil karta-sumka. Sahifaning butun ishi shu rasmni ekranga
 * to'g'ri joylash, ustiga narxni yozish va pastga bitta tugma qo'yish.
 *
 * UCH QOIDA:
 *
 * 1. SARLAVHA YO'Q. «Open budjet boshlandi» va brend belgilari rasmning
 *    O'ZIDA. HTML header qo'shilsa logotip ikki marta chiqadi.
 * 2. NARX BRENDNING TAGIDA. Rasmda logotip qatoridan keyin bo'sh ko'k zona
 *    bor — narx o'sha yerga, plakatning o'z yozuvi bilan bir chiziqqa
 *    tushadi. Shrift bosma (Archivo), chunki plakat sarlavhasi ham bosma.
 * 3. RASM KESILADI, LEKIN SUMKA KESILMAYDI. O'lchov `--pw` da — izohi
 *    `page.module.css` da.
 *
 * Narx `price_one_vote` sozlamasidan keladi (standart qiymat «30 000»), ya'ni
 * uni admin panelidan o'zgartirish mumkin. Bu sahifa `lib/payout.ts` dagi
 * to'lov raqamiga BOG'LIQ EMAS: u yerdagi 20 000 asosiy sahifadagi banknota
 * rasmiga bog'langan, bu yerdagi rasmda esa banknota nominali ko'rsatilmagan.
 *
 * Sahifa to'liq statik (SSG); yagona client kod — Tracker.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Ochiq budjet — ovoz bering, pul oling',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#001426',
  colorScheme: 'dark',
};

export default async function VariantPlakat() {
  const s = await getSettings();
  const bot = (s.bot_username || env.BOT).replace(/^@/, '');
  const tg = tgLink(bot, 'web');

  return (
    <div className={`${a.screen} ${c.page} doc-ob`}>
      {/* Rasmning o'z ko'k fonining CSS davomi — plakat tepasida va
          yonlarida shu ko'rinadi, shuning uchun ranglar rasmdan olingan */}
      <div className={c.sky} aria-hidden />

      <figure className={c.poster}>
        <img
          src="/pul-sumkasi.webp"
          alt="Ochiq budjet: pul solingan yashil karta-sumka"
          width={941}
          height={1672}
          className={c.shot}
          fetchPriority="high"
          decoding="async"
        />

        {/* Logotip qatorining tagidagi bo'sh ko'k zona */}
        <figcaption className={c.hand}>
          <span className={c.handTop}>har bir ovoz uchun</span>
          <span className={c.handSum}>
            <span className={c.handNum}>
              {s.price_one_vote}
              {/* Marker halqasi — qo'lda aylantirilgandek, ideal ellips emas */}
              <svg className={c.ring} viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
                <path d="M186 16C160 5 96 2 46 9 10 14 4 34 22 46c24 15 102 17 152 8 19-4 26-13 14-22" />
              </svg>
            </span>
            <span className={c.handCur}>so‘m</span>
          </span>
        </figcaption>
      </figure>

      {/* Tugma sumkaning pastki qismi ustiga tushadi — busiz oq tugma
          yashil plastikda «suzib» qolardi */}
      <div className={c.scrim} aria-hidden />

      <div className={`${a.wrap} ${c.wrap}`}>
        <div className={`${a.cta} ${c.cta}`}>
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v6_vote"
            data-tg
            rel="noopener"
          >
            <Telegram size={21} />
            Ovoz berish
          </a>
          <p className={`${a.note} ${c.note}`}>Telegramda ochiladi · @{bot}</p>
        </div>
      </div>

      <Tracker />
    </div>
  );
}
