/**
 * Telegram deep link — barcha sahifalardagi tugmalar uchun YAGONA manba.
 *
 * Manzil admin paneldagi `bot_username` sozlamasidan keladi, ya'ni bot
 * almashsa bitta maydon o'zgaradi va `/`, `/1`–`/9`, `/l` — hammasi yangi
 * botga ketadi. Kodda hech qanday bot nomi yozilmagan.
 *
 * Sozlamaga NIMA YOZILSA ham tushunadi, chunki amalda u yerga Telegram'dan
 * nusxa olingan to'liq havola tashlanadi:
 *
 *   OpenBudgetBot                       → https://t.me/OpenBudgetBot?start=web
 *   @OpenBudgetBot                      → https://t.me/OpenBudgetBot?start=web
 *   t.me/OpenBudgetBot                  → https://t.me/OpenBudgetBot?start=web
 *   https://t.me/OpenBudgetBot          → https://t.me/OpenBudgetBot?start=web
 *   https://telegram.me/OpenBudgetBot   → https://t.me/OpenBudgetBot?start=web
 *   https://t.me/OpenBudgetBot?start=ig → https://t.me/OpenBudgetBot?start=ig
 *
 * Oxirgi qator muhim: havolada `start` bo'lsa u SAQLANADI — reklama
 * kabinetidan berilgan tamg'ani sahifa o'chirib yubormasligi kerak.
 *
 * HAVOLA BRAUZERDA O'ZGARMAYDI. Ilgari `lib/track.ts` uning ustiga UTM
 * tamg'asini qo'shardi (`?start=dilnura__instagram-v5_01`), lekin bot
 * referalni aynan taqqoslagani uchun reklamadan kelganlar hisobga
 * tushmay qoldi. Endi tugmada nima yozilgan bo'lsa, botga o'sha boradi.
 *
 * Qaysi kadrdan kelgani `/admin` statistikasida ko'rinadi — u UTM'ni
 * sahifa manzilidan o'qiydi, havoladan emas.
 */

/** Telegram username qoidasi: harf/raqam/pastki chiziq, 5–32 belgi */
const USERNAME = /^[a-zA-Z0-9_]{4,32}$/;

/** `start` parametriga ruxsat etilgan belgilar (Telegram cheklovi) */
function safeStart(v: string, fallback: string): string {
  const s = v.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60);
  return s || fallback;
}

/**
 * Sozlamadagi qiymatdan bot nomi va (bo'lsa) `start` ni ajratadi.
 * Tanib bo'lmasa `null` — chaqiruvchi zaxira qiymatga tushadi.
 */
function parse(raw: string): { bot: string; start?: string } | null {
  const v = (raw || '').trim();
  if (!v) return null;

  // Oddiy username: «bot» yoki «@bot»
  const bare = v.replace(/^@/, '');
  if (USERNAME.test(bare)) return { bot: bare };

  // Havola — sxemasiz yozilgan bo'lsa ham (`t.me/bot`) URL'ga aylantiramiz
  try {
    const u = new URL(/^[a-z]+:\/\//i.test(v) ? v : `https://${v}`);
    if (!/(^|\.)(t\.me|telegram\.me|telegram\.dog)$/i.test(u.hostname)) return null;

    const bot = u.pathname.split('/').filter(Boolean)[0]?.replace(/^@/, '') ?? '';
    if (!USERNAME.test(bot)) return null;

    const start = u.searchParams.get('start') || u.searchParams.get('startapp') || undefined;
    return start ? { bot, start } : { bot };
  } catch {
    return null;
  }
}

export function tgLink(bot: string, start = 'web'): string {
  const parsed = parse(bot);
  // Sozlama buzilgan bo'lsa tugma o'lik havolaga aylanmasin: shu qiymatning
  // o'zini tozalab ishlatamiz (eski xatti-harakat).
  const name = parsed?.bot ?? bot.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
  const s = safeStart(parsed?.start ?? start, 'web');
  return `https://t.me/${name}?start=${s}`;
}

/** Sozlamadagi qiymatdan sof username — `@kanal` ko'rinishida chiqarish uchun */
export function tgUsername(bot: string): string {
  return parse(bot)?.bot ?? bot.replace(/^@/, '').replace(/[^a-zA-Z0-9_]/g, '');
}
