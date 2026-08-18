import type { Metadata } from 'next';

import Aurora from '@/components/landing/Aurora';
import { getSettings } from '@/lib/data';

/**
 * Variant 3 — «Aurora Premium».
 *
 * Bu dizayn ASOSIY sahifaga (`/`) ko'chirilgan, shuning uchun razmetka
 * `components/landing/Aurora.tsx` da turadi — ikkalasi bitta manbadan
 * quriladi. Bu yerda faqat A/B qobiq: almashtirgich yoqiladi va sahifa
 * qidiruvdan yopiladi.
 *
 * Nega `/3` saqlanib qoldi: variant almashtirgichi va reklama havolalari
 * unga ishora qiladi. O'chirilsa ular sinardi, foydasi esa yo'q — sahifa
 * baribir asosiy komponentni qayta ishlatadi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B nusxasi — indeks faqat asosiy sahifada (`/`), bu yerda takror emas */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

export default async function VariantAurora() {
  const s = await getSettings();
  return <Aurora s={s} prefix="v3" showSwitcher />;
}
