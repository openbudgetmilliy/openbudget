import type { Metadata, Viewport } from 'next';

import Tracker from '@/components/Tracker';
import { Telegram } from '@/components/Icons';

import { getSettings } from '@/lib/data';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import a from '@/components/landing/adscreen.module.css';
import c from './page.module.css';

/**
 * Variant 7 — «Plakat».
 *
 * Boshqa variantlar sahifani noldan chizadi; bu esa TAYYOR REKLAMA RASMINI
 * (`assets/open-budjet-fon.png` → `public/open-budjet-fon.webp`) butun
 * ekranga qo'yadi va ustiga faqat ikki narsa qo'shadi: tepadagi narx va
 * pastdagi tugma.
 *
 * Nega sahifada matn yo'q: rasmda brend belgisi, «OPEN BUDJET BOSHLANDI»
 * sarlavhasi va pulga ishora qilayotgan strelka allaqachon bor. Ularni
 * HTML'da takrorlash plakatni ikki marta aytishga olib kelardi — natijada
 * na rasm, na matn o'qilardi.
 *
 * NARX MANBASI — `price_one_vote` (admin sozlamasi, bugun «30 000»), ya'ni
 * bir ovozning botdagi SOTUV narxi. Bu ATAYIN `lib/payout.ts` dagi `PAYOUT`
 * emas: u odam OLADIGAN summa (20 000) va boshqa gapni aytadi. Narx admin
 * panelida o'zgarsa, plakatdagi qo'lyozma ham o'sha kuni o'zgaradi —
 * shuning uchun u shu yerda raqam bilan yozib qo'yilmagan.
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
  themeColor: '#080d14',
  colorScheme: 'dark',
};

export default async function VariantPlakat() {
  const s = await getSettings();
  const tg = tgLink(s.bot_username || env.BOT, 'web');

  return (
    <div className={`${a.screen} ${c.page} doc-navy`}>
      {/* Plakat — sahifadagi yagona og'ir element va LCP nomzodi.
          `<img>` emas, fon: u matn oqimiga kirmaydi va ekranni to'ldirishi
          kerak; o'lchamlari CSS'da, shuning uchun layout sakramaydi. */}
      <div className={c.bg} aria-hidden />
      <div className={c.veil} aria-hidden />

      {/* Narx plakatning O'Z geometriyasiga bog'lanadi, ekranning emas:
          `.frame` fon rasmi bilan bir xil o'lchamdagi quti, ichidagi
          foizlar esa rasmdagi joylarga to'g'ri keladi. */}
      <div className={c.frame}>
        <div className={c.wash} aria-hidden />
        <p className={c.hand}>
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
        </p>
      </div>

      <div className={a.wrap}>
        <div className={`${a.mid} ${c.mid}`}>
          <p className={c.hint}>
            Ovoz berish botda — Uzcard yoki Humo karta bilan, 2 daqiqada.
          </p>
        </div>

        <div className={a.cta}>
          <a
            href={tg}
            className={`${a.btn} ${c.primary}`}
            data-t="cta"
            data-t-id="v7_bot"
            data-tg
            rel="noopener"
          >
            <Telegram size={20} />
            Botga o‘tish
          </a>
          <p className={`${a.note} ${c.note}`}>{s.reviews_count} kishi allaqachon qatnashdi</p>
        </div>
      </div>

      <Tracker />
    </div>
  );
}
