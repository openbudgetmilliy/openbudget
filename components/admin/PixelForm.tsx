'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Landing = { path: string; name: string; slug: string };
type Check = { ok: boolean; text: string } | null;

/**
 * HAR SAHIFA UCHUN PIXEL.
 *
 * Har landing alohida reklama qilinadi, ya'ni har biri boshqa reklama
 * kabinetiga tegishli bo'lishi mumkin. Shu jadval har sahifaga o'z pixel
 * ID'sini biriktiradi; bo'sh qoldirilsa o'sha sahifada pixel umuman
 * ishlamaydi.
 *
 * «Tekshirish» tugmasi ID formatini emas, JONLI SAHIFANI tekshiradi:
 * server sahifani ochib, ichida shu ID bilan `fbq('init')` borligini
 * qidiradi. Ya'ni «saqladim» degan xabar emas, «Meta kodi haqiqatan
 * sahifada» degan javob beradi. Sahifalar 60 soniyada bir qayta
 * chizilgani uchun saqlangandan keyin darhol tekshirish erta bo'lishi
 * mumkin — o'shanda tugmani bir-ikki soniyadan keyin qayta bosish kerak.
 */
export default function PixelForm({
  landings,
  values,
}: {
  landings: Landing[];
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Check>(null);
  const [checks, setChecks] = useState<Record<string, Check>>({});

  const dirty = landings.some((l) => draft[`pixel_${l.slug}`] !== values[`pixel_${l.slug}`]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const changed = Object.fromEntries(
        landings
          .map((l) => `pixel_${l.slug}`)
          .filter((k) => draft[k] !== values[k])
          .map((k) => [k, (draft[k] ?? '').trim()]),
      );
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(changed),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'Saqlanmadi');
      setMsg({ ok: true, text: `Saqlandi — ${j.updated} ta sahifa. Jonli sahifada bir daqiqa ichida ko’rinadi.` });
      setChecks({});
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function check(path: string, slug: string) {
    setChecks((c) => ({ ...c, [slug]: { ok: true, text: 'tekshirilyapti…' } }));
    try {
      const r = await fetch(`/api/admin/pixel-check?path=${encodeURIComponent(path)}`);
      const j = await r.json();
      setChecks((c) => ({
        ...c,
        [slug]: j.found
          ? { ok: true, text: `ishlayapti — ${j.ids.join(', ')}` }
          : { ok: false, text: j.error ?? 'sahifada pixel topilmadi' },
      }));
    } catch {
      setChecks((c) => ({ ...c, [slug]: { ok: false, text: 'tekshirib bo’lmadi' } }));
    }
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Meta Pixel — har sahifa uchun alohida</span>
        <button className="a-btn" onClick={save} disabled={!dirty || busy}>
          {busy ? 'Saqlanyapti…' : 'Saqlash'}
        </button>
      </div>

      {msg && (
        <div className="a-panel-b">
          <div className={msg.ok ? 'a-ok' : 'a-err'}>{msg.text}</div>
        </div>
      )}

      <div className="a-tw">
        <table className="a-t">
          <thead>
            <tr>
              <th>Sahifa</th>
              <th style={{ width: 230 }}>Pixel ID</th>
              <th style={{ width: 220 }}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {landings.map((l) => {
              const k = `pixel_${l.slug}`;
              const c = checks[l.slug];
              const v = (draft[k] ?? '').trim();
              const bad = v !== '' && !/^\d{5,20}$/.test(v);
              return (
                <tr key={l.slug}>
                  <td>
                    <span style={{ fontWeight: 650 }}>{l.name}</span>
                    <div className="muted" style={{ fontSize: 12 }}>{l.path}</div>
                  </td>
                  <td>
                    <input
                      className="a-in"
                      inputMode="numeric"
                      placeholder="masalan 1846594980073377"
                      value={draft[k] ?? ''}
                      disabled={busy}
                      onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                      style={bad ? { borderColor: '#e0564f' } : undefined}
                    />
                    {bad && (
                      <div style={{ fontSize: 12, color: '#e0564f', marginTop: 4 }}>
                        faqat raqam, 5–20 xona
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="a-btn ghost"
                      onClick={() => check(l.path, l.slug)}
                      disabled={busy || dirty}
                      title={dirty ? 'Avval saqlang' : 'Jonli sahifani tekshirish'}
                    >
                      Tekshirish
                    </button>
                    {c && (
                      <div
                        style={{ fontSize: 12, marginTop: 6, color: c.ok ? '#34d399' : '#e0564f' }}
                      >
                        {c.text}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="a-panel-b" style={{ borderTop: '1px solid #1b2331' }}>
        <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, margin: 0 }}>
          ID Meta Events Manager’dagi 15–16 xonali raqam. Bo’sh qoldirilsa — o’sha sahifada pixel
          umuman ishlamaydi. Har sahifada <code>PageView</code>, har tugma bosilganda{' '}
          <code>Lead</code> yuboriladi. Saqlagandan so’ng jonli sahifa bir daqiqa ichida
          yangilanadi — «Tekshirish» shundan keyin aniq javob beradi.
        </p>
      </div>
    </div>
  );
}
