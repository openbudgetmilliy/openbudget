import { notFound } from 'next/navigation';

import AutoRefresh from '@/components/admin/AutoRefresh';
import CopyLink from '@/components/admin/CopyLink';
import DbDown from '@/components/admin/DbDown';
import RangePicker, { parseHours } from '@/components/admin/RangePicker';
import TrafficChart from '@/components/admin/TrafficChart';

import { LANDINGS, adLink } from '@/lib/landings';
import {
  landingPages,
  pageBreakdown,
  pageButtons,
  pageHourly,
  pageSessions,
} from '@/lib/stats';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * BITTA SAHIFANING ANALITIKASI — `/admin/p/<slug>`.
 *
 * Dashboarddagi jadvalda qatorga bosilganda shu ochiladi. Savol bitta:
 * SHU sahifaga qancha odam keldi va SHU sahifadagi tugma necha marta
 * bosildi. Qolgan hamma narsa — soat taqsimoti, qurilma, sessiyalar —
 * o'sha ikki raqamni tushuntirish uchun.
 *
 * Raqamlar dashboarddagi jadval bilan BIR XIL so'rovdan keladi
 * (`landingPages`), ya'ni ular hech qachon bir-biriga zid chiqmaydi.
 * Agar bu yerda alohida `count(*)` yozilganda, ikki joyda ikki xil
 * qiymat paydo bo'lish ehtimoli bo'lardi.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = LANDINGS.find((x) => x.slug === slug);
  return { title: l ? l.name : 'Sahifa' };
}

export default async function PageDetail({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ h?: string }>;
}) {
  const { slug } = await params;
  const landing = LANDINGS.find((x) => x.slug === slug);
  if (!landing) notFound();

  const hours = parseHours((await searchParams).h, 168);
  const base = `/admin/p/${slug}`;

  let d;
  try {
    const [all, hrs, btns, sess, devices, sources] = await Promise.all([
      landingPages(hours),
      pageHourly(landing.path, hours),
      pageButtons(landing.path, hours),
      pageSessions(landing.path, hours, 40),
      pageBreakdown(landing.path, 'device', hours),
      pageBreakdown(landing.path, 'utmSource', hours),
    ]);
    d = { all, hrs, btns, sess, devices, sources };
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">{landing.name}</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  const row = d.all.find((r) => r.page === landing.path) ?? {
    page: landing.path,
    entries: 0,
    viewers: 0,
    clicks: 0,
    clickers: 0,
    cr: 0,
  };

  /* Umumiy ulush: shu sahifa butun trafikning qancha qismini olib kelgan */
  const totalEntries = d.all.reduce((a, r) => a + r.entries, 0);
  const share = totalEntries ? Math.round((row.entries / totalEntries) * 100) : 0;
  const maxBtn = Math.max(...d.btns.map((b) => b.clicks), 1);

  return (
    <>
      <p className="a-sub" style={{ marginBottom: 4 }}>
        <a href="/admin">← Barcha sahifalar</a>
      </p>
      <h1 className="a-h1">{landing.name}</h1>
      <p className="a-sub">
        <a href={landing.path} target="_blank" rel="noopener">
          {landing.path}
        </a>{' '}
        · {landing.note}
      </p>

      <div className="a-row">
        <RangePicker base={base} hours={hours} />
        <span style={{ marginLeft: 'auto' }} />
        <AutoRefresh seconds={30} />
      </div>

      <div className="a-cards">
        <div className="a-card">
          <div className="a-card-k">Kirdi</div>
          <div className="a-card-v">{row.entries}</div>
          <div className="a-card-n">shu sahifadan boshlagan</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Ko’rdi</div>
          <div className="a-card-v">{row.viewers}</div>
          <div className="a-card-n">noyob foydalanuvchi</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Tugma bosildi</div>
          <div className="a-card-v tg">{row.clicks}</div>
          <div className="a-card-n">{row.clickers} kishi bosgan</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Konversiya</div>
          <div className="a-card-v gold">{row.cr}%</div>
          <div className="a-card-n">bosgan / ko’rgan</div>
        </div>
        <div className="a-card">
          <div className="a-card-k">Umumiy ulush</div>
          <div className="a-card-v">{share}%</div>
          <div className="a-card-n">barcha kirishlardan</div>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">Reklama havolasi</div>
        <div className="a-panel-b" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <code style={{ fontSize: 12.5, color: '#93a1b8' }}>{adLink(env.SITE_URL, landing)}</code>
          <CopyLink url={adLink(env.SITE_URL, landing)} />
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">Soatlar bo’yicha kirish</div>
        <div className="a-panel-b">
          {d.hrs.length ? <TrafficChart data={d.hrs} /> : <div className="a-empty">Ma’lumot yo’q</div>}
        </div>
      </div>

      <div className="a-grid-2">
        <div className="a-panel">
          <div className="a-panel-h">Qaysi tugma bosilgan</div>
          {d.btns.length ? (
            <div className="a-tw">
              <table className="a-t">
                <thead>
                  <tr>
                    <th>Tugma</th>
                    <th className="num">Bosildi</th>
                    <th className="num">Odam</th>
                    <th style={{ width: 90 }} />
                  </tr>
                </thead>
                <tbody>
                  {d.btns.map((b, i) => (
                    <tr key={`${b.elId}-${i}`}>
                      <td>
                        <span className="a-tag">{b.elId ?? '—'}</span>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {b.elText ?? ''}
                        </div>
                      </td>
                      <td className="num" style={{ fontWeight: 700 }}>
                        {b.clicks}
                      </td>
                      <td className="num">{b.users}</td>
                      <td>
                        <span className="a-bar-t" style={{ display: 'block' }}>
                          <span
                            className="a-bar-f"
                            style={{ width: `${Math.round((b.clicks / maxBtn) * 100)}%` }}
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="a-empty">Bu sahifada hali tugma bosilmagan</div>
          )}
        </div>

        <div className="a-panel">
          <div className="a-panel-h">Kim keldi</div>
          <div className="a-panel-b">
            <Bars title="Qurilma" rows={d.devices} />
            <div style={{ height: 14 }} />
            <Bars title="Manba" rows={d.sources} />
          </div>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Shu sahifaga tushgan sessiyalar</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
            oxirgi {d.sess.length} ta
          </span>
        </div>
        {d.sess.length ? (
          <div className="a-tw">
            <table className="a-t">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Manba</th>
                  <th>Qurilma</th>
                  <th className="num">Event</th>
                  <th className="num">Vaqt</th>
                  <th className="num">Scroll</th>
                  <th>Bosdimi</th>
                </tr>
              </thead>
              <tbody>
                {d.sess.map((s) => (
                  <tr key={s.id}>
                    <td className="muted">
                      {new Date(s.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="muted">{s.utmSource ?? s.browser ?? '—'}</td>
                    <td className="muted">{s.device ?? '—'}</td>
                    <td className="num">{s.events}</td>
                    <td className="num">{s.dwellSec}s</td>
                    <td className="num">{s.maxScroll}%</td>
                    <td>{s.converted ? <span className="a-tag">ha</span> : <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="a-empty">Bu sahifaga hali hech kim tushmagan</div>
        )}
      </div>
    </>
  );
}

/** Kichik gorizontal diagramma — qurilma/manba kesimi uchun */
function Bars({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <>
      <div style={{ fontSize: 12.5, color: '#59637a', marginBottom: 8 }}>{title}</div>
      {rows.length ? (
        rows.map((r) => (
          <div className="a-bar" key={r.label}>
            <span className="muted">{r.label}</span>
            <span className="a-bar-t">
              <span className="a-bar-f" style={{ width: `${Math.round((r.n / max) * 100)}%` }} />
            </span>
            <span className="a-bar-n">{r.n}</span>
          </div>
        ))
      ) : (
        <div className="a-empty">Ma’lumot yo’q</div>
      )}
    </>
  );
}
