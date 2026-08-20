import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

/**
 * Reklama ekranlarining fon rasmlarini manbadan yasaydi:
 *   npm run assets:ad
 *
 * `build-logos.ts` va `build-home-assets.ts` dagi qoida shu yerda ham amal
 * qiladi: MANBA `assets/` da (internetga chiqmaydi), chiqindi `public/` da.
 *
 * open-budjet-fon.webp — `/7` ning butun ekranli foni. Sahifadagi YAGONA
 *   og'ir element va aniq LCP: sifat 70 ga tushirilgan, chunki rasm baribir
 *   fon sifatida — matn va tugma ostida, quyuqlashtirilgan pardaning orqasida
 *   ko'rsatiladi. Manba o'lchami (941×1672) o'zgartirilmaydi: u telefon
 *   ekranining nisbatiga (≈9:16) allaqachon mos va undan kattaroq nusxa
 *   hech qayerda kerak emas.
 */

type Out = { file: string; note: string; bytes: number };
const done: Out[] = [];

async function emit(file: string, note: string, buf: Buffer) {
  await writeFile(file, buf);
  done.push({ file, note, bytes: buf.length });
}

async function main() {
  await emit(
    'public/open-budjet-fon.webp',
    "/7 fon rasmi (941×1672)",
    await sharp('assets/open-budjet-fon.png')
      .webp({ quality: 70, smartSubsample: true })
      .toBuffer(),
  );

  const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
  console.log('\n▶ Reklama ekrani rasmlari\n');
  for (const d of done) console.log(`  ✓ ${d.file.padEnd(30)} ${kb(d.bytes).padStart(9)}  ${d.note}`);
  console.log('');
}

main().catch((e) => {
  console.error('✗ Xato:', (e as Error).message);
  process.exit(1);
});
