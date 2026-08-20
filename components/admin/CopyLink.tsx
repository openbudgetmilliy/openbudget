'use client';

import { useState } from 'react';

/**
 * Reklama havolasini bir bosishda nusxalash.
 *
 * Reklama kabinetiga havola QO'LDA ko'chirilganda eng ko'p uchraydigan xato —
 * `utm_content` ni tushirib qoldirish yoki noto'g'ri sahifani qo'yish.
 * Shuning uchun havola tayyor holda beriladi va faqat nusxalanadi.
 *
 * `navigator.clipboard` faqat HTTPS'da (yoki localhost'da) ishlaydi; ishlamasa
 * matn tanlanadigan holda qolaveradi — shuning uchun havola ekranda ham
 * ko'rinib turadi, tugma esa qulaylik, yagona yo'l emas.
 */
export default function CopyLink({ url }: { url: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      /* clipboard yopiq — foydalanuvchi matnni o'zi belgilaydi */
    }
  }

  return (
    <button className="a-btn sm" onClick={copy} title={url} type="button">
      {done ? '✓ nusxalandi' : 'Nusxalash'}
    </button>
  );
}
