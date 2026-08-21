'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Landing = { path: string; name: string; slug: string };

/**
 * HAR SAHIFA UCHUN ALOHIDA BOT HAVOLASI.
 *
 * Nima uchun kerak: umumiy havolaga bir marta `?start=dilnura` yozilsa, u
 * to'qqizala sahifada bir xil bo'lib qoladi va bot kimning qaysi kadrdan
 * kelganini ajrata olmaydi. Bu jadval har kadrga o'z havolasini beradi.
 *
 * BO'SH QOLDIRISH — ODATIY HOL. Bo'sh qator «umumiy havola ishlaydi»
 * degani; hamma sahifa bitta botga ketsa, bu jadvalga umuman tegmasa
 * bo'ladi. Shuning uchun bo'sh maydon xato deb belgilanmaydi.
 *
 * Har qatorning tagida HISOBLANGAN natija ko'rsatiladi — odam «nima
 * yozdim» emas, «tugma qayerga olib boradi» ni ko'rishi kerak.
 */

/** `lib/tg.ts` dagi mantiqning brauzerdagi nusxasi — faqat ko'rsatish uchun */
function preview(raw: string, slug: string, fallback: string): string {
  const v = (raw || '').trim() || fallback;
  const name = /^[a-zA-Z0-9_]{4,32}$/;
  let bot = '';
  let start: string | undefined;

  const bare = v.replace(/^@/, '');
  if (name.test(bare)) {
    bot = bare;
  } else {
    try {
      const u = new URL(/^[a-z]+:\/\//i.test(v) ? v : `https://${v}`);
      if (!/(^|\.)(t\.me|telegram\.me|telegram\.dog)$/i.test(u.hostname)) return '— tanib bo’lmadi';
      bot = (u.pathname.split('/').filter(Boolean)[0] ?? '').replace(/^@/, '');
      if (!name.test(bot)) return '— tanib bo’lmadi';
      start = u.searchParams.get('start') || u.searchParams.get('startapp') || undefined;
    } catch {
      return '— tanib bo’lmadi';
    }
  }

  // Sahifa maydoni bo'sh bo'lsa umumiy havola ishlaydi — u `web` tamg'asi
  // bilan ketadi, sahifa slug'i bilan emas
  const tag = (start ?? (raw.trim() ? slug : 'web')).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  return `t.me/${bot}?start=${tag || 'web'}`;
}

export default function BotLinkForm({
  landings,
  values,
  fallback,
}: {
  landings: Landing[];
  values: Record<string, string>;
  /** Umumiy `bot_username` — bo'sh qatorlar shunga tushadi */
  fallback: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(values);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty = landings.some((l) => draft[`bot_${l.slug}`] !== values[`bot_${l.slug}`]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const changed = Object.fromEntries(
        landings
          .map((l) => `bot_${l.slug}`)
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
      setMsg({
        ok: true,
        text: `Saqlandi — ${j.updated} ta sahifa. Kesh tozalandi, o’zgarish bir necha soniyada ko’rinadi.`,
      });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-panel">
      <div className="a-panel-h">
        <span>Bot havolasi — har sahifa uchun alohida</span>
        <button className="a-btn" onClick={save} disabled={!dirty || busy} type="button">
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
              <th style={{ width: 200 }}>Sahifa</th>
              <th>Havola yoki username</th>
              <th style={{ width: 230 }}>Tugma qayerga boradi</th>
            </tr>
          </thead>
          <tbody>
            {landings.map((l) => {
              const k = `bot_${l.slug}`;
              const v = draft[k] ?? '';
              const own = v.trim() !== '';
              return (
                <tr key={l.slug}>
                  <td>
                    <span style={{ fontWeight: 650 }}>{l.name}</span>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {l.path}
                    </div>
                  </td>
                  <td>
                    <input
                      className="a-in"
                      placeholder={`bo’sh — umumiy havola ishlaydi`}
                      value={v}
                      disabled={busy}
                      onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                    />
                  </td>
                  <td>
                    <code
                      style={{
                        fontSize: 11.5,
                        color: own ? '#93a1b8' : '#59637a',
                        wordBreak: 'break-all',
                        lineHeight: 1.5,
                      }}
                    >
                      {preview(v, l.slug, fallback)}
                    </code>
                    <div style={{ fontSize: 11.5, color: '#59637a', marginTop: 3 }}>
                      {own ? 'shu sahifaning o’z havolasi' : 'umumiy'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="a-panel-b" style={{ borderTop: '1px solid #1b2331' }}>
        <p style={{ fontSize: 12.5, color: '#59637a', lineHeight: 1.65, margin: 0 }}>
          Bo’sh qator — yuqoridagi umumiy havola ishlaydi. To’ldirilsa, o’sha sahifadagi barcha
          tugmalar shu manzilga ketadi. Havolada <code>?start=</code> bo’lsa u saqlanadi; bo’lmasa
          sahifa tamg’asi qo’yiladi (<code>/3</code> → <code>?start=v3</code>) — o’shanda bot
          odam qaysi kadrdan kelganini biladi.
        </p>
      </div>
    </div>
  );
}
