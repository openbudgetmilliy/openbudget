'use client';

import { useEffect, useRef } from 'react';

import c from './BackgroundGate.module.css';

type TurnstileOpts = {
  sitekey: string;
  theme?: 'auto' | 'light' | 'dark';
  language?: string;
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOpts) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __bgGateOnload?: () => void;
  }
}

const SCRIPT_ID = 'cf-turnstile';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__bgGateOnload';

/** UX belgisi — haqiqiy ruxsat emas, u HttpOnly `gt` cookie'da */
function alreadyVerified(): boolean {
  return document.cookie.split('; ').some((x) => x === 'gt_ok=1');
}

/**
 * Cloudflare Turnstile — FON rejimida.
 *
 * Ilgari tekshiruv alohida darvoza ekrani edi: odam `/` da halqa aylanishini
 * kutar, keyin `/l` ga o'tkazilardi. Endi sahifa darhol ochiladi va tekshiruv
 * shu yerda, sahifa ortida ishlaydi — hech narsani kutish shart emas.
 *
 * Uch qoida:
 *
 * 1. HECH QACHON BLOKLAMAYDI. Kontent tekshiruvdan mustaqil ko'rinadi;
 *    xato bo'lsa ham sahifa ishlab turaveradi (`catch` — jim).
 * 2. `interaction-only` — widget FAQAT Cloudflare haqiqatan odam
 *    aralashuvini talab qilsa ko'rinadi. Odatiy holda u ko'rinmas va
 *    uyasi bo'sh qoladi, shuning uchun `:empty` uni butunlay yashiradi.
 * 3. QAYTA KELGANGA TEGMAYDI. `gt_ok` belgisi bo'lsa skript ham
 *    yuklanmaydi: 12 soat ichida ikkinchi tekshiruvning ma'nosi yo'q.
 *
 * Muvaffaqiyatli tekshiruv `/api/gate` orqali `gt` cookie'sini qo'yadi —
 * cookie va uni beruvchi tekshiruv (rate-limit bilan) ilgarigidek qoladi,
 * faqat endi u kirishni to'smaydi.
 */
export default function BackgroundGate({ siteKey }: { siteKey: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  /** Bitta token bir marta yuborilsin — Cloudflare takrorini rad etadi */
  const sentRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return;
    if (alreadyVerified()) return;

    let alive = true;

    const onToken = async (token: string) => {
      if (sentRef.current) return;
      sentRef.current = true;
      try {
        await fetch('/api/gate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        /* Fon tekshiruvi — tarmoq xatosi sahifaga ta'sir qilmasligi kerak */
      }
    };

    const mount = () => {
      if (!alive || !boxRef.current || !window.turnstile || widgetRef.current) return;
      try {
        widgetRef.current = window.turnstile.render(boxRef.current, {
          sitekey: siteKey,
          theme: 'light',
          language: 'auto',
          appearance: 'interaction-only',
          callback: onToken,
          'error-callback': () => {
            sentRef.current = false;
          },
          'expired-callback': () => {
            sentRef.current = false;
          },
          'timeout-callback': () => {
            sentRef.current = false;
          },
        });
      } catch {
        /* Widget qurilmadi — sahifa baribir ishlaydi */
      }
    };

    if (window.turnstile) {
      mount();
    } else {
      window.__bgGateOnload = mount;
      if (!document.getElementById(SCRIPT_ID)) {
        const el = document.createElement('script');
        el.id = SCRIPT_ID;
        el.src = SCRIPT_SRC;
        el.async = true;
        el.defer = true;
        document.head.appendChild(el);
      }
    }

    return () => {
      alive = false;
      if (widgetRef.current) {
        window.turnstile?.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [siteKey]);

  if (!siteKey) return null;

  // Uya odatda bo'sh — `:empty` uni yashiradi. Faqat Cloudflare katakcha
  // ko'rsatsa pastki burchakda paydo bo'ladi.
  return <div className={c.slot} ref={boxRef} />;
}
