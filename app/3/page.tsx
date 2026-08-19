import type { Metadata } from 'next';

import Aurora from '@/components/landing/Aurora';
import { getSettings } from '@/lib/data';

/**
 * Variant 3 — «Aurora Premium».
 *
 * Bir vaqtlar asosiy sahifa (`/`) ham shu dizaynda edi; asosiy sahifa
 * «Oltin» ekraniga o'tgach, bu dizayn shu yerda qoldi. Razmetka
 * `components/landing/Aurora.tsx` da — marshrut faqat qobiq: almashtirgich
 * yoqiladi va sahifa qidiruvdan yopiladi.
 */
export const revalidate = 60;
export const dynamic = 'force-static';

/** A/B varianti — qidiruvga chiqmasin, asosiy sahifa boshqa dizaynda */
export const metadata: Metadata = {
  title: 'Mukofot dasturi',
  robots: { index: false, follow: false },
};

export default async function VariantAurora() {
  const s = await getSettings();
  return <Aurora s={s} prefix="v3" showSwitcher />;
}
