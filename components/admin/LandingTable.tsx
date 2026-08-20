import CopyLink from './CopyLink';
import { LANDINGS, adLink, landingBy } from '@/lib/landings';
import type { LandingRow } from '@/lib/stats';
import { env } from '@/lib/env';

/**
 * SAHIFALAR KESIMI — analitikaning asosiy jadvali.
 *
 * Har bir landing alohida reklama qilinadi, shuning uchun bitta jadvalda
 * uch savolga birdan javob bo'lishi kerak:
 *
 *   1. qaysi sahifaga qancha odam kirdi,
 *   2. o'sha sahifadagi tugma necha marta bosildi,
 *   3. reklamaga qo'yiladigan havola qaysi.
 *
 * Trafigi bo'lmagan sahifalar ham ATAYIN ko'rsatiladi (nol bilan): reklama
 * yoqilgan-yoqilmagani shu yerdan bilinadi. Ro'yxatda yo'q, lekin
 * statistikada uchragan yo'llar (masalan eski havola) oxirida chiqadi —
 * ular yo'qolib qolmasligi kerak.
 */
export default function LandingTable({
  rows,
  showLinks = true,
}: {
  rows: LandingRow[];
  showLinks?: boolean;
}) {
  const byPath = new Map(rows.map((r) => [r.page, r]));

  const known = LANDINGS.map((l) => ({
    landing: l,
    row: byPath.get(l.path) ?? { page: l.path, entries: 0, viewers: 0, clicks: 0, clickers: 0, cr: 0 },
  }));

  // Ro'yxatdan tashqari yo'llar — o'chirilgan variant yoki noto'g'ri havola
  const extra = rows
    .filter((r) => !landingBy(r.page))
    .map((row) => ({ landing: null, row }));

  const all = [...known, ...extra].sort((a, b) => b.row.viewers - a.row.viewers || b.row.entries - a.row.entries);
  const maxClicks = Math.max(...all.map((x) => x.row.clicks), 1);
  const totals = all.reduce(
    (a, x) => ({
      entries: a.entries + x.row.entries,
      viewers: a.viewers + x.row.viewers,
      clicks: a.clicks + x.row.clicks,
    }),
    { entries: 0, viewers: 0, clicks: 0 },
  );

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Sahifalar bo’yicha — kim keldi, kim bosdi</span>
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
          {totals.entries} kirish · {totals.clicks} bosish
        </span>
      </div>
      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th>Sahifa</th>
              <th className="num" title="Sessiya aynan shu sahifadan boshlangan">
                Kirdi
              </th>
              <th className="num" title="Sahifani ochgan noyob foydalanuvchilar">
                Ko’rdi
              </th>
              <th className="num" title="Shu sahifadagi tugma necha marta bosilgan">
                Bosildi
              </th>
              <th className="num" title="Tugmani bosgan noyob foydalanuvchilar">
                Bosgan odam
              </th>
              <th className="num">CR</th>
              <th style={{ width: 120 }} />
              {showLinks && <th>Reklama havolasi</th>}
            </tr>
          </thead>
          <tbody>
            {all.map(({ landing, row }) => (
              <tr key={row.page}>
                <td>
                  {/* Nom — SAHIFA ANALITIKASIGA, yo'l esa jonli sahifaga.
                      Ikkisi ikki xil ish: biri raqamlarni ochadi, ikkinchisi
                      sahifaning o'zini yangi oynada. */}
                  {landing ? (
                    <a href={`/admin/p/${landing.slug}`} style={{ fontWeight: 650 }}>
                      {landing.name}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 650 }}>{row.page}</span>
                  )}
                  <div className="muted" style={{ fontSize: 12 }}>
                    {landing ? (
                      <>
                        <a href={row.page} target="_blank" rel="noopener" className="muted">
                          {row.page}
                        </a>{' '}
                        · {landing.note}
                      </>
                    ) : (
                      'ro’yxatda yo’q'
                    )}
                  </div>
                </td>
                <td className="num">{row.entries}</td>
                <td className="num">{row.viewers}</td>
                <td className="num" style={{ fontWeight: 700 }}>
                  {row.clicks}
                </td>
                <td className="num">{row.clickers}</td>
                <td className="num" style={{ fontWeight: 700, color: row.cr > 0 ? '#34d399' : undefined }}>
                  {row.cr}%
                </td>
                <td>
                  <span className="a-bar-t" style={{ display: 'block' }}>
                    <span
                      className="a-bar-f"
                      style={{ width: `${Math.round((row.clicks / maxClicks) * 100)}%` }}
                    />
                  </span>
                </td>
                {showLinks && (
                  <td>
                    {landing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ fontSize: 11.5, color: '#93a1b8', whiteSpace: 'nowrap' }}>
                          {adLink(env.SITE_URL, landing).replace(/^https?:\/\//, '')}
                        </code>
                        <CopyLink url={adLink(env.SITE_URL, landing)} />
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showLinks && (
        <div className="a-panel-b" style={{ borderTop: '1px solid #1b2331' }}>
          <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, margin: 0 }}>
            Har sahifa uchun havola alohida — reklamani qaysi biriga qo’ysangiz, kirganlar shu
            qatorda sanaladi. <code>utm_content</code> dagi <code>_01</code> ni har kreativga
            almashtiring (<code>v7_02</code>, <code>v7_story</code>) — o’shanda «Kreativlar»
            jadvalida qaysi video ishlagani ham ko’rinadi.
          </p>
        </div>
      )}
    </div>
  );
}
