import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { refreshLanding } from '@/lib/cf';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { LANDINGS } from '@/lib/landings';
import { validPixel } from '@/lib/pixels';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = new Set(Object.keys(DEFAULT_SETTINGS));

/**
 * Sahifa pixellari (`pixel_main`, `pixel_v3` …) sozlamalar ro'yxatida yo'q:
 * ular `DEFAULT_SETTINGS` ga kirmaydi, chunki har biri bitta sahifaga
 * tegishli va standart qiymati yo'q. Kalitni SHU YERDA tekshiramiz —
 * ro'yxatdagi landing slug'i bilan mos kelsagina yoziladi, ya'ni ixtiyoriy
 * kalit yuborib bazani to'ldirib bo'lmaydi.
 */
const PIXEL_KEYS = new Set(LANDINGS.map((l) => `pixel_${l.slug}`));

/**
 * Sahifa bot havolalari (`bot_main`, `bot_v3` …). `bot_username` bilan
 * ADASHTIRMASLIK kerak: u umumiy sozlama va `DEFAULT_SETTINGS` da bor,
 * bular esa har sahifaga tegishli va standart qiymati yo'q.
 */
const BOT_KEYS = new Set(LANDINGS.map((l) => `bot_${l.slug}`));

/** Bo'sh qiymat ham to'g'ri: pixelni o'chirish shunday qilinadi */
function pixelOk(v: string): boolean {
  return v.trim() === '' || validPixel(v);
}

export async function GET(): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const rows = await prisma.setting.findMany();
  const values: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const r of rows) values[r.key] = r.value;
  return Response.json({ ok: true, values, keys: [...ALLOWED, ...PIXEL_KEYS, ...BOT_KEYS] });
}

export async function PATCH(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return Response.json({ ok: false, error: 'Noto’g’ri JSON' }, { status: 400 });
  }

  const entries = Object.entries(body as Record<string, unknown>).filter(
    ([k, v]) =>
      typeof v === 'string' && (ALLOWED.has(k) || PIXEL_KEYS.has(k) || BOT_KEYS.has(k)),
  ) as [string, string][];

  // Noto'g'ri pixel ID jim saqlanib qolmasin — aks holda sahifa Meta'ga
  // buzilgan ID bilan murojaat qilib, hech narsa hisoblanmasdi
  const bad = entries.filter(([k, v]) => PIXEL_KEYS.has(k) && !pixelOk(v));
  if (bad.length) {
    return Response.json(
      { ok: false, error: `Pixel ID faqat raqamlardan iborat bo’lishi kerak (5–20 xona): ${bad.map(([k]) => k).join(', ')}` },
      { status: 400 },
    );
  }

  const updates = entries.map(([k, v]) => ({ key: k, value: v.slice(0, 500) }));

  if (!updates.length) {
    return Response.json({ ok: false, error: 'Ruxsat etilgan maydon yo’q' }, { status: 400 });
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.setting.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value },
        update: { value: u.value },
      }),
    ),
  );

  const cache = await refreshLanding();
  return Response.json({ ok: true, updated: updates.length, cache });
}
