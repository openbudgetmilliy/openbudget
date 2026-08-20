import AdsBoard from '@/components/admin/AdsBoard';
import DbDown from '@/components/admin/DbDown';
import LandingTable from '@/components/admin/LandingTable';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';

import { LANDINGS } from '@/lib/landings';
import { landingPages } from '@/lib/stats';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reklama' };

/**
 * REKLAMA TABI.
 *
 * Ikki ish bir joyda:
 *   1. HAVOLA OLISH — har kadr uchun UTM tamg'ali tayyor havola;
 *   2. NATIJANI KO'RISH — o'sha havolalar qancha olib kelgani.
 *
 * Ikkalasi bitta ekranda turishi ataylab: havolani qo'yib, natijani boshqa
 * bo'limdan qidirish kerak bo'lsa, ular bir-biriga bog'lanmay qoladi.
 */
export default async function AdsPage({
  searchParams,
}: {
  searchParams: Promise<{ h?: string }>;
}) {
  const hours = parseHours((await searchParams).h, 168);

  let pages;
  try {
    pages = await landingPages(hours);
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Reklama</h1>
        <AdsBoard landings={LANDINGS} origin={env.SITE_URL} />
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Reklama</h1>
      <p className="a-sub">Har kadr — alohida havola, alohida statistika</p>

      <AdsBoard landings={LANDINGS} origin={env.SITE_URL} />

      <div className="a-row">
        <RangePicker base="/admin/reklama" hours={hours} />
      </div>

      <LandingTable rows={pages} showLinks={false} />
    </>
  );
}
