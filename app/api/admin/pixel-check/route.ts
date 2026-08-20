import { requireAdmin } from '@/lib/auth';
import { LANDINGS } from '@/lib/landings';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * PIXEL TEKSHIRUVI — «saqlandi» emas, «ishlayapti».
 *
 * Admin panelidagi «Tekshirish» tugmasi shu yerga keladi. Biz ID formatini
 * emas, JONLI SAHIFANI o'qiymiz: server o'sha sahifani HTTP orqali ochadi
 * va ichida `fbq('init','<id>')` borligini qidiradi.
 *
 * Nega shunday: sozlama saqlansa ham sahifa SSG va keshda turgan bo'lishi
 * mumkin. Faqat sahifaning O'ZINI o'qib, pixel haqiqatan tashrifchiga
 * yetayotganini bilish mumkin.
 *
 * `cache: 'no-store'` MAJBURIY — busiz Next o'z keshidan javob berib,
 * eski holatni «ishlayapti» deb ko'rsatib qo'yardi.
 */
export async function GET(req: Request): Promise<Response> {
  if (!(await requireAdmin())) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const path = new URL(req.url).searchParams.get('path') ?? '';
  const landing = LANDINGS.find((l) => l.path === path);
  if (!landing) {
    return Response.json({ ok: false, found: false, error: 'Sahifa ro’yxatda yo’q' }, { status: 400 });
  }

  const url = `${env.SITE_URL.replace(/\/$/, '')}${landing.path}`;

  try {
    const res = await fetch(url, { cache: 'no-store', headers: { 'user-agent': 'ob-pixel-check' } });
    if (!res.ok) {
      return Response.json({ ok: true, found: false, error: `sahifa ochilmadi (${res.status})` });
    }
    const html = await res.text();
    const ids = [...html.matchAll(/fbq\('init','(\d{5,20})'\)/g)].map((m) => m[1]);
    return Response.json({
      ok: true,
      found: ids.length > 0,
      ids: [...new Set(ids)],
      error: ids.length ? undefined : 'sahifada fbq init topilmadi',
    });
  } catch (e) {
    return Response.json({ ok: true, found: false, error: (e as Error).message });
  }
}
