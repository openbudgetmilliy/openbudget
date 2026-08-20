import { Manrope } from 'next/font/google';

import Tracker from '@/components/Tracker';
import Countdown from '@/components/landing/Countdown';

import type { Settings } from '@/lib/data';
import { campaignLeft, isOpen } from '@/lib/campaign';
import { price } from '@/lib/payout';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';

import st from './Oltin.module.css';

/**
 * «Oltin» — saytning ASOSIY ekrani (domen ochilganda shu chiqadi).
 *
 * Manba: dizayn kanvasidagi `Main.dc.html` (393×852 telefon artbordi) va
 * uning brauzer nusxasi `open-budjet-8-oltin.html`. Kompozitsiya AYNAN
 * ko'chirildi — bitta ekran, skrollsiz: belgi, yorliq, sarlavha, tavsif,
 * banknota, ishonch qatori va ikki tugma.
 *
 * Uch qoida (buzilsa dizayn yo'qoladi):
 *
 * 1. BITTA EKRAN, SKROLL YO'Q. Sahifa telefon ekraniga to'liq sig'adi.
 *    Bo'sh joy ikkita "cho'zuvchi" (`.gap`) orqali taqsimlanadi: sarlavha
 *    tepada, tugmalar pastda — o'rtada banknota. Pastga bo'lim qo'shilsa
 *    kompozitsiya buziladi, bu sahifaning butun ma'nosi — bitta qarash.
 * 2. IKKI RANG, IKKI VAZIFA. To'q ko'k (#222C3F, belgining o'z foni) —
 *    hamma joyda; oltin (#D9B25C) — FAQAT harakat va urg'u (yorliq,
 *    asosiy tugma, qalqon). Uchinchi rang yo'q.
 * 3. MATN QISQA. Sarlavha 44px, tavsif 290px kenglikda uzilib turadi.
 *    Uzun matn shu o'lchamlarda ekrandan chiqib ketadi.
 *
 * Kontrast (fon #222C3F): oq → 13.2:1, #C3C8D1 → 7.9:1, oltin → 6.7:1,
 * oltin tugmada to'q ko'k matn → 6.7:1. Hammasi WCAG AA dan yuqori.
 *
 * Sahifa to'liq statik (SSG). Yagona client kod — `Tracker`, ya'ni tugma
 * bosilishi (Meta «Lead») va UTM tamg'asi. Undan boshqa hydration yo'q.
 */

/**
 * Manrope — ATAYIN shu yerda, `app/fonts.ts` da emas.
 *
 * `app/fonts.ts` root layout'ga ulangan: u yerga qo'shilgan oila BARCHA
 * marshrutlarga (jumladan `/1`–`/9`, `/l`, admin) preload bo'lib tushardi.
 * Bu yozuv esa faqat shu komponent chizilgan sahifaga qo'shiladi.
 *
 * O'zgaruvchan shrift: 500–800 og'irliklar bitta fayldan keladi.
 */
const manrope = Manrope({ subsets: ['latin'], variable: '--f-oltin', display: 'swap' });

/**
 * Ekrandagi brend yorlig'i.
 *
 * Dizaynda «OpenBudget» — belgi ham o'sha (`public/openbudget-mark.webp`).
 * `SITE.brand` (MilliyJamosimiz) esa meta-sarlavha va JSON-LD da qoladi.
 * Ikkalasini birlashtirish kerak bo'lsa — shu bitta qator o'zgaradi.
 */
const BRAND = 'OpenBudget';


export default function Oltin({ s }: { s: Settings }) {
  const tg = tgLink(s.bot_username || env.BOT, 'web');
  const left = campaignLeft();

  return (
    /* `oltin-dark` — global klass: `globals.css` shu orqali `html`/`body`
       fonini ham to'q qiladi (iOS rezina skrollida oq chiziq chiqmasin) */
    <div className={`${manrope.variable} ${st.page} oltin-dark`}>
      <div className={st.screen}>
        {/* Fondagi suv belgisi — o'ng yuqori burchakdan chiqib turadi.
            `z-index: -1` matn ostida qoladi, `.screen` esa uni kesadi. */}
        <img
          src="/openbudget-mark.webp"
          alt=""
          width={420}
          height={420}
          className={st.watermark}
          aria-hidden
        />

        <header className={st.head}>
          <img
            src="/openbudget-mark.webp"
            alt=""
            width={30}
            height={30}
            className={st.headMark}
            decoding="async"
          />
          <span className={st.brand}>{BRAND}</span>
        </header>

        <div className={st.copy}>
          <p className={st.badge}>FAOL OVOZ BERISH</p>
          <h1 className={st.h1}>Ovoz bering, pul oling</h1>
          <p className={st.sub}>
            Har bir ovoz uchun <b className={st.subSum}>{price(s)} so‘m</b> oling — mahallangizdagi
            suv, yo‘l va qurilishga hissa qo‘shing.
          </p>
        </div>

        <div className={st.gap} aria-hidden />

        {/* Banknota — sahifadagi eng katta rasm va LCP nomzodi, shuning
            uchun `fetchPriority="high"`: brauzer uni birinchi so'raydi.

            DIQQAT: manba rasm 20 000 so'mlik banknota. Matndagi narx admin
            sozlamasidan keladi, rasm esa yo'q — sozlamada boshqa nominal
            qo'yilsa `assets/yigirma-ming.jpg` ni almashtirib
            `npm run assets:home` ni qayta ishlatish kerak. Shuning uchun
            `alt` da summa yo'q: rasm bezak, da'vo emas. */}
        <img
          src="/yigirma-ming.webp"
          alt="So‘m banknotalari"
          width={654}
          height={305}
          className={st.money}
          fetchPriority="high"
          decoding="async"
        />

        <p className={st.trust}>
          <ShieldCheck />
          Kafolatlangan to‘lov
        </p>

        <div className={st.gap} aria-hidden />

        {/* Ikkala tugma ham bitta botga olib boradi (start qiymati bir xil —
            bot yangi payload kutmaydi). Qaysi tugma bosilganini analitika
            `data-t-id` orqali ajratadi. */}
        <div className={st.act}>
          <a
            href={tg}
            className={`${st.btn} ${st.btnP}`}
            data-t="cta"
            data-t-id="main_vote"
            data-tg
            rel="noopener"
          >
            Ovoz berish
          </a>
          <a
            href={tg}
            className={`${st.btn} ${st.btnS}`}
            data-t="cta"
            data-t-id="main_payout"
            data-tg
            rel="noopener"
          >
            Pulni olish
          </a>
        </div>

        {/* Aksiya muddati — ekranning eng pastida. Ikkita `.gap` cho'zuvchi
            bo'sh joyni yutgani uchun kompozitsiya siljimaydi: taymer
            o'sha bo'shliqning bir qismini oladi, xolos. */}
        {isOpen() ? (
          <Countdown
            initial={left}
            /* Sarlavhasiz: bitta ekranli kadrda joy tor, kataklar ostidagi
               kun/soat/daq/son yorlig'i vaqtni o'zi tushuntiradi */
            lead=""
            classes={{ root: st.cd, cell: st.cdCell, num: st.cdNum, lab: st.cdLab }}
          />
        ) : null}
      </div>

      <Tracker />
    </div>
  );
}

/**
 * Qalqon + belgi — «Kafolatlangan to'lov» qatorining ikonkasi.
 *
 * `components/Icons.tsx` dagilardan farqi: bu yerda IKKI rang bor (oltin
 * qalqon, uning ichida to'q ko'k belgi), ya'ni `currentColor` bilan
 * ishlamaydi. Shu sabab u umumiy ikonkalar faylida emas, shu dizayn ichida.
 */
function ShieldCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={st.shield}>
      <path d="M12 2l7 3v6c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5l7-3z" fill="#d9b25c" />
      <path
        d="M8.5 12.3l2.4 2.3 4.6-4.9"
        stroke="#222c3f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
