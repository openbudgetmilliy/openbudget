/**
 * AKSIYA SHARTLARI — barcha landing sahifalari uchun YAGONA MANBA.
 *
 * `/1`–`/8` da pastdagi taymer shu sanadan hisoblanadi. Sana bir joyda
 * turgani uchun sahifalar bir-biridan ajralib keta olmaydi: birida
 * «30-avgust», ikkinchisida boshqa kun chiqishi mumkin emas.
 *
 * VAQT MINTAQASI ATAYIN YOZILGAN (+05:00, Toshkent). Ofsetsiz yozilsa
 * sana build ketayotgan mashinaning mintaqasida o'qilardi: serverda UTC,
 * noutbukda UTC+5 — taymer besh soatga adashardi.
 *
 * MUDDAT O'TSA: sahifalar taymerni ko'rsatishni to'xtatadi (`isOpen()`
 * `false` qaytaradi). Nol turgan taymer «aksiya tugadi» degan xabar
 * bo'lardi va reklama trafigini bekorga yoqib yuborardi. Lekin sarlavhadagi
 * va'da o'z-o'zidan yangilanmaydi — aksiya uzaysa shu yerdagi sanani
 * QO'LDA o'zgartirish kerak.
 */

export const CAMPAIGN = {
  /** Ovoz berish tugaydigan payt — Toshkent vaqti */
  deadline: '2026-08-30T23:59:00+05:00',
  /** Sarlavhalardagi yuqori chegara (`/8`) */
  ceiling: '100 000 so‘mgacha',
  /** Qo'shimcha sovrin (`/8`) */
  prize: 'iPhone 17 Pro Max',
} as const;

export const DEADLINE_MS = Date.parse(CAMPAIGN.deadline);

const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

/**
 * Qolgan millisekund. Sahifa uni serverda hisoblab, `Countdown` ga
 * boshlang'ich qiymat sifatida beradi — client birinchi renderda AYNAN
 * shuni chizadi, ya'ni hydration mos keladi.
 *
 * SSG sahifasi keshdan kelgani uchun bu qiymat bir necha daqiqa eskirgan
 * bo'lishi mumkin; client uni hydration tugagan zahoti to'g'irlaydi.
 */
export function campaignLeft(): number {
  return Math.max(0, DEADLINE_MS - Date.now());
}

/** Muddat hali tugamaganmi */
export function isOpen(): boolean {
  return campaignLeft() > 0;
}

/**
 * «30-avgust, 23:59» — Toshkent vaqtida.
 *
 * `getUTC*` ATAYIN: vaqtga +5 soat qo'shib UTC maydonlarini o'qiymiz.
 * Shunda natija build qayerda ketishiga bog'liq bo'lmaydi.
 */
export function deadlineLabel(): string {
  const d = new Date(DEADLINE_MS + 5 * 3_600_000);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]}, ${hh}:${mm}`;
}
