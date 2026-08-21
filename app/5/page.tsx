import type { Metadata, Viewport } from 'next';

import Countdown from '@/components/landing/Countdown';
import MetaPixel from '@/components/MetaPixel';
import Tracker from '@/components/Tracker';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { campaignLeft, isOpen } from '@/lib/campaign';
import { price } from '@/lib/payout';
import { botLinkFor } from '@/lib/botlinks';
import { tgUsername } from '@/lib/tg';
import { env } from '@/lib/env';

import c from './page.module.css';

/**
 * Variant 5 — «Yashil stiker».
 *
 * Manba: foydalanuvchi bergan story-kreativ. Qop-qora fon, burchagi
 * qiyshaygan salat rangli stiker, uch qatorli og'ir sarlavha, oq kartochka
 * (ortida salat rangli siljigan soya), kartochka ichida serif matn va
 * bot manzili, pastda to'liq enli salat tugma.
 *
 * IKKI QIYMAT SOZLAMADAN, KREATIVDAN EMAS:
 *
 *   NARX — kreativda «50.000» yozilgan, sahifada esa `price_one_vote`
 *   ko'rinadi. Sabab: to'qqizala sahifa bitta raqamni ko'rsatishi kerak,
 *   aks holda odam `/3` da bir narsani, `/5` da boshqasini o'qiydi.
 *   Kampaniya 50 000 bilan ketadigan bo'lsa — `/admin/settings` da bitta
 *   maydonni o'zgartirish yetadi, to'qqiztasi birdan yangilanadi.
 *
 *   BOT MANZILI — kreativda `@Ishonchlibudget` yozilgan, bu boshqa bot.
 *   Kartochkadagi manzil ham, tugmadagi havola ham `bot_username` dan
 *   olinadi: ekranda ko'rinib turgan manzil bilan tugma bir joyga olib
 *   borishi shart.
 *
 * Sahifa to'liq statik (SSG).
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, indeks faqat asosiy sahifada */
export const metadata: Metadata = {
  title: 'Ovoz uchun pul to‘laydigan bot',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#070805',
  colorScheme: 'dark',
};

/** Kartochkadan tugmaga ishora — qo'lda chizilgandek, ideal yoy emas */
function Arrow() {
  return (
    <svg className={c.arrow} viewBox="0 0 90 120" aria-hidden>
      <path d="M18 6c34 10 54 34 56 62 1 12-2 24-8 35" />
      <path d="M48 88l18 18 16-20" />
    </svg>
  );
}

export default async function VariantStiker() {
  const s = await getSettings();
  const tg = await botLinkFor('/5', s.bot_username);
  // Kartochkada ko'rinadigan manzil TUGMA BILAN BIR XIL bo'lishi shart —
  // shuning uchun u hisoblangan havoladan olinadi, sozlamadan emas
  const bot = tgUsername(tg);
  const left = campaignLeft();
  const open = isOpen();

  return (
    <div className={`${c.screen} doc-lime`}>
      {/* Pastdagi salat yog'du — kreativdagi tugma ortidagi nur */}
      <div className={c.glow} aria-hidden />

      <div className={c.wrap}>
        {/* Stiker ATAYIN qiyshiq va matndan kengroq: u yopishtirilgan
            qog'oz taassurotini beradi, bosilgan sarlavha emas */}
        <p className={c.sticker}>
          1ta ovoz <b>{price(s)}</b> so‘m
        </p>

        <h1 className={c.title}>
          Ovoz Uchun Pul To‘layotgan <span className={c.nowrap}>Yagona Bot!</span>
        </h1>

        <div className={c.card}>
          <p className={c.cardT}>
            Telegram Botga Kirib Start Bosing!
            <br />
            Ovoz Uchun Pul Oling!
          </p>

          <a href={tg} className={c.pill} data-t="cta" data-t-id="v5_bot" data-tg rel="noopener">
            <span className={c.pillIcon} aria-hidden>
              <Telegram size={19} />
            </span>
            @{bot}
          </a>
        </div>

        <div className={c.between}>
          {open ? (
            <Countdown
              initial={left}
              lead=""
              classes={{
                root: c.cd,
                cell: c.cdCell,
                num: c.cdNum,
                lab: c.cdLab,
              }}
            />
          ) : null}
          <Arrow />
        </div>

        <div className={c.cta}>
          <a href={tg} className={c.btn} data-t="cta" data-t-id="v5_vote" data-tg rel="noopener">
            Ovoz berish
          </a>
        </div>
      </div>

      <MetaPixel path="/5" />
      <Tracker />
    </div>
  );
}
