import { prisma } from './prisma';
import { env } from './env';

/**
 * Landing uchun ma'lumot o'qish.
 *
 * Bu funksiyalar FAQAT build va revalidate paytida chaqiriladi — foydalanuvchi
 * so'rovida emas. Shu sabab Prisma cho'qqi trafikda ishtirok etmaydi.
 * DB yetib bo'lmasa zaxira qiymat qaytadi va build davom etadi.
 */



export const DEFAULT_SETTINGS = {
  bot_username: env.BOT,
  /**
   * BIR OVOZ NARXI — barcha landing sahifalari uchun yagona manba.
   *
   * `/`, `/1`–`/9`, `/l` shu qiymatni `lib/payout.ts` orqali o'qiydi, ya'ni
   * bu maydon o'zgarsa narx hamma sahifada birdek o'zgaradi. Matnlardagi
   * `{narx}` o'rin egallovchisi ham shu yerdan to'ldiriladi.
   *
   * Format erkin — «30 000», «30000» yoki «30 000 so'm» ham bo'ladi:
   * `lib/payout.ts` faqat raqamlarni oladi va guruhlab qayta chizadi.
   */
  price_one_vote: '30 000',

  tg_channel: 'openbudget_uz',
  reviews_count: '8 000+',
} as const;

export type Settings = Record<keyof typeof DEFAULT_SETTINGS, string>;

export async function getSettings(): Promise<Settings> {
  const out: Settings = { ...DEFAULT_SETTINGS };
  if (!env.DATABASE_URL) return out;
  try {
    const rows = await prisma.setting.findMany();
    for (const r of rows) {
      if (r.key in out && r.value) out[r.key as keyof Settings] = r.value;
    }
  } catch (err) {
    console.warn('[build] sozlamalar DB dan olinmadi:', (err as Error).message);
  }
  return out;
}
