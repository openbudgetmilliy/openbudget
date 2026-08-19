import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

/**
 * Asosiy sahifa («Oltin» ekrani) rasmlarini manbadan yasaydi:
 *   npm run assets:home
 *
 * `scripts/build-logos.ts` dagi qoida shu yerda ham amal qiladi: MANBA
 * `assets/` da, chiqindi `public/` da. Manba JPEG'lar dizayn faylidan
 * kelgan (Claude Design kanvasi), ular internetga chiqmasligi kerak —
 * sahifa faqat siqilgan WebP nusxalarini so'raydi.
 *
 * Ikki fayl, ikki vazifa:
 *
 *   openbudget-mark.webp — header belgisi (30px) VA fondagi suv belgisi
 *     (420px, 10% shaffoflik). Bitta fayl ikkalasiga yetadi — brauzer uni
 *     bir marta yuklab, ikkala joyda ishlatadi. Shuning uchun o'lcham eng
 *     kattasi bo'yicha (2x = 840px emas, manba 640px — undan yuqorisi yo'q).
 *
 *   yigirma-ming.webp — 20 000 so'mlik banknota. Sahifadagi eng og'ir
 *     element va LCP nomzodi, shuning uchun sifat 75 ga tushirilgan:
 *     rasm 12px radius bilan, kichik o'lchamda ko'rsatiladi — farq
 *     ko'rinmaydi, vazn esa ikki barobar yengil.
 */

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

async function emit(file: string, note: string, buf: Buffer) {
  await writeFile(file, buf);
  done.push({ file, note, bytes: buf.length });
}

async function main() {
  await emit(
    'public/openbudget-mark.webp',
    'header belgisi + fon suv belgisi',
    await sharp('assets/openbudget-mark.jpg')
      .resize(640, 640, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer(),
  );

  await emit(
    'public/yigirma-ming.webp',
    "20 000 so'mlik banknota",
    await sharp('assets/yigirma-ming.jpg')
      .webp({ quality: 75, smartSubsample: true })
      .toBuffer(),
  );

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log('\n▶ Asosiy sahifa rasmlari\n');
  for (const d of done) console.log(`  ✓ ${d.file.padEnd(30)} ${kb(d.bytes).padStart(9)}  ${d.note}`);
  console.log('');
}

main().catch((e) => {
  console.error('✗ Xato:', (e as Error).message);
  process.exit(1);
});
