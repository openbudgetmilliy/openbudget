'use client';

import { useMemo, useState } from 'react';

type Landing = { path: string; name: string; slug: string; note: string };

/**
 * REKLAMA HAVOLALARI — har kadr uchun alohida.
 *
 * Sakkizta sahifaning har biri alohida reklama qilinadi, ya'ni har biri
 * alohida havola talab qiladi. Havolani qo'lda yozishda eng ko'p uchraydigan
 * ikki xato — `utm_content` ni tushirib qoldirish va noto'g'ri sahifani
 * qo'yish; ikkalasi ham statistikani ishlatib bo'lmaydigan qilib qo'yadi.
 * Shuning uchun havolalar SHU YERDA yig'iladi. Havolaning o'zi ekranda
 * ko'rinib turadi — qo'lda tanlab olish mumkin.
 */

const SOURCES = ['instagram', 'facebook', 'telegram', 'tiktok', 'youtube'];
const MEDIUMS = ['paid', 'stories', 'reels', 'post', 'bio'];

export default function AdsBoard({
  landings,
  origin,
}: {
  landings: Landing[];
  origin: string;
}) {
  const [source, setSource] = useState('instagram');
  const [medium, setMedium] = useState('paid');
  const [campaign, setCampaign] = useState('');
  const [creative, setCreative] = useState('01');

  const base = origin.replace(/\/$/, '');

  const links = useMemo(
    () =>
      landings.map((l) => {
        const q = new URLSearchParams();
        const put = (k: string, v: string) => {
          const t = v.trim();
          if (t) q.set(k, t);
        };
        put('utm_source', source);
        put('utm_medium', medium);
        put('utm_campaign', campaign);
        put('utm_content', creative.trim() ? `${l.slug}_${creative.trim()}` : l.slug);
        return {
          l,
          site: `${base}${l.path === '/' ? '/' : l.path}?${q.toString()}`,
        };
      }),
    [landings, base, source, medium, campaign, creative],
  );

  return (
    <>
      <div className="a-panel">
        <div className="a-panel-h">
          <span>Tamg’alar — sakkizala havolaga birdan qo’llanadi</span>
        </div>
        <div className="a-panel-b">
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
            <Field label="Manba" hint="utm_source">
              <input
                className="a-in"
                list="ad-sources"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
              <datalist id="ad-sources">
                {SOURCES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>

            <Field label="Turi" hint="utm_medium">
              <input
                className="a-in"
                list="ad-mediums"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
              />
              <datalist id="ad-mediums">
                {MEDIUMS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>

            <Field label="Kampaniya" hint="utm_campaign">
              <input
                className="a-in"
                placeholder="masalan avgust_aksiya"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </Field>

            <Field label="Kreativ" hint="utm_content oxiri">
              <input
                className="a-in"
                placeholder="01"
                value={creative}
                onChange={(e) => setCreative(e.target.value)}
              />
            </Field>
          </div>

          <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, marginTop: 14, marginBottom: 0 }}>
            Bitta kadrning bir necha varianti bo’lsa — «Kreativ» ni har biriga boshqacha qo’ying
            (<code>01</code>, <code>02</code>, <code>story</code>). O’shanda «Analitika →
            Kreativlar» jadvalida qaysi video ishlagani ajraladi. Bo’sh maydon havolaga umuman
            qo’shilmaydi.
          </p>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-h">
          <span>Har kadr uchun havola</span>
          <span style={{ fontSize: 12.5, fontWeight: 400, color: '#59637a' }}>
            {links.length} ta sahifa
          </span>
        </div>
        <div className="a-tw">
          <table className="a-t">
            <thead>
              <tr>
                <th style={{ width: 210 }}>Kadr</th>
                <th>Sayt havolasi</th>
              </tr>
            </thead>
            <tbody>
              {links.map(({ l, site }) => (
                <tr key={l.slug}>
                  <td>
                    <a href={`/admin/p/${l.slug}`} style={{ fontWeight: 650 }}>
                      {l.name}
                    </a>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {l.path} · {l.note}
                    </div>
                  </td>
                  <td>
                    <code
                      style={{
                        fontSize: 11.5,
                        color: '#93a1b8',
                        display: 'block',
                        wordBreak: 'break-all',
                        lineHeight: 1.5,
                        marginBottom: 6,
                      }}
                    >
                      {site.replace(/^https?:\/\//, '')}
                    </code>
                    <a className="a-btn sm ghost" href={site} target="_blank" rel="noopener">
                      Ochish ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="a-panel-b" style={{ borderTop: '1px solid #1b2331' }}>
          <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, margin: 0 }}>
            Sayt havolasi — reklamani sahifaga olib boradi, kirgan odam «Sahifalar bo’yicha»
            jadvalida o’sha qatorda sanaladi.
          </p>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="a-lbl">
        {label} <code style={{ color: '#3f4a5c' }}>{hint}</code>
      </label>
      {children}
    </div>
  );
}
