/**
 * LANDING SAHIFALAR RO'YXATI — bitta manba.
 *
 * Har bir sahifa alohida reklama qilinadi, ya'ni har biri o'z havolasiga,
 * o'z trafigiga va o'z statistikasiga ega. Ro'yxat shu yerda turadi va uch
 * joyda ishlatiladi:
 *
 *   · `/admin` va `/admin/analytics` — sahifalar kesimidagi jadval va
 *     nusxa olinadigan reklama havolalari;
 *   · `lib/cf.ts` — narx/sozlama o'zgarganda qaysi yo'llar keshdan
 *     tozalanishi;
 *   · statistikada `page` ustunini odam o'qiydigan nomga aylantirish.
 *
 * Yangi variant qo'shilsa — SHU RO'YXATGA bitta qator. Boshqa hech qayerda
 * sahifa yo'lini qo'lda yozish shart emas.
 *
 * `adable: false` — reklama qilinmaydigan yo'llar (ular jadvalda «reklama
 * havolasi» ustunisiz chiqadi).
 */
export type Landing = {
  path: string;
  name: string;
  /** Reklama kabinetida ishlatiladigan qisqa tamg'a — `utm_content` uchun asos */
  slug: string;
  note: string;
  adable?: boolean;
};

export const LANDINGS: Landing[] = [
  { path: '/', name: 'Asosiy — «Oltin»', slug: 'main', note: 'Domen ochilganda shu chiqadi' },
  { path: '/2', name: 'Variant 2 — «Moviy»', slug: 'v2', note: 'Reklama ekrani' },
  { path: '/3', name: 'Variant 3 — «Karta»', slug: 'v3', note: 'Reklama ekrani' },
  { path: '/4', name: 'Variant 4 — «Hisob»', slug: 'v4', note: 'Hisoblagichli ekran' },
  { path: '/5', name: 'Variant 5 — «Qo‘lyozma»', slug: 'v5', note: 'Daftar varag‘i' },
  { path: '/6', name: 'Variant 6 — «Sumka plakati»', slug: 'v6', note: 'Tayyor rasm plakat' },
  { path: '/7', name: 'Variant 7 — «Open Budjet plakati»', slug: 'v7', note: 'Rasm plakat' },
  { path: '/8', name: 'Variant 8 — «Neon»', slug: 'v8', note: 'Aksiya ekrani, taymerli' },
  { path: '/9', name: 'Variant 9 — «Banknota»', slug: 'v9', note: 'Qora fon, 100 ming so‘mlik' },
];

/** Kesh tozalash uchun — `lib/cf.ts` shu ro'yxatdan foydalanadi */
export const LANDING_PATHS = LANDINGS.map((l) => l.path);

const BY_PATH = new Map(LANDINGS.map((l) => [l.path, l]));

/** Statistikadagi xom yo'lni odam o'qiydigan nomga aylantiradi */
export function landingName(path: string | null | undefined): string {
  if (!path) return 'noma’lum';
  return BY_PATH.get(path)?.name ?? path;
}

export function landingBy(path: string | null | undefined): Landing | undefined {
  return path ? BY_PATH.get(path) : undefined;
}

/**
 * Reklama uchun tayyor havola.
 *
 * UTM tamg'alari reklama kabinetida ham, `/admin` statistikasida ham bir xil
 * o'qiladi:
 *
 *   `utm_source`   — qayerda reklama qilinyapti (instagram, telegram, tiktok)
 *   `utm_medium`   — turi (paid, stories, reels…)
 *   `utm_campaign` — kampaniya nomi
 *   `utm_content`  — KREATIV. Sahifaning o'zi yo'ldan bilinadi, lekin bu
 *                    yerga ham sahifa slug'i qo'shiladi: bitta kadrning bir
 *                    necha varianti bo'lsa (`v3_01`, `v3_story`), qaysi biri
 *                    ishlagani «Kreativlar» jadvalida ko'rinadi.
 *
 * Bo'sh qiymatlar havolaga UMUMAN qo'shilmaydi — `utm_medium=` kabi quruq
 * tamg'a statistikani ifloslantiradi va reklama kabinetlari uni ba'zan
 * «(not set)» deb emas, alohida qiymat deb hisoblaydi.
 */
export type AdParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  /** `utm_content` oxiriga qo'shiladigan tamg'a — standart `01` */
  creative?: string;
};

export function adLink(origin: string, l: Landing, p: AdParams = {}): string {
  // Yo'l oxirida qiya chiziq YO'Q: `next.config.js` da `trailingSlash`
  // yoqilmagan, ya'ni `/7/` → `/7` ga redirect bo'lardi. Reklama havolasida
  // ortiqcha sakrash — yo'qotilgan klik.
  const base = `${origin.replace(/\/$/, '')}${l.path === '/' ? '/' : l.path}`;

  const creative = (p.creative ?? '01').trim();
  const q = new URLSearchParams();
  const put = (k: string, v?: string) => {
    const t = (v ?? '').trim();
    if (t) q.set(k, t);
  };

  put('utm_source', p.source ?? 'instagram');
  put('utm_medium', p.medium);
  put('utm_campaign', p.campaign);
  put('utm_content', creative ? `${l.slug}_${creative}` : l.slug);

  return `${base}?${q.toString()}`;
}

/**
 * Botga to'g'ridan-to'g'ri havola — `?start=<slug>`.
 *
 * Sahifadagi tugmalar ham shu tamg'ani olib boradi (`lib/tg.ts`), ya'ni bot
 * odam qaysi kadrdan kelganini SAYTDAN mustaqil biladi. Reklamani to'g'ridan
 * botga qo'yganda ham xuddi shu tamg'a ishlaydi.
 */
export function botLink(bot: string, l: Landing): string {
  const b = bot.replace(/^@/, '');
  return `https://t.me/${b}?start=${l.slug}`;
}
