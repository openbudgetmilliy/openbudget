import DbDown from '@/components/admin/DbDown';
import BotLinkForm from '@/components/admin/BotLinkForm';
import PixelForm from '@/components/admin/PixelForm';
import SettingsForm from '@/components/admin/SettingsForm';
import { DEFAULT_SETTINGS } from '@/lib/data';
import { LANDINGS } from '@/lib/landings';
import { allBotLinks } from '@/lib/botlinks';
import { allPixels } from '@/lib/pixels';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sozlamalar' };

export default async function SettingsPage() {
  let values: Record<string, string>;
  let pixels: Record<string, string>;
  let botLinks: Record<string, string>;
  try {
    const [rows, px, bl] = await Promise.all([
      prisma.setting.findMany(),
      allPixels(),
      allBotLinks(),
    ]);
    values = { ...DEFAULT_SETTINGS };
    for (const r of rows) if (r.key in values) values[r.key] = r.value;
    pixels = px;
    botLinks = bl;
  } catch (err) {
    return (
      <>
        <h1 className="a-h1">Sozlamalar</h1>
        <DbDown error={(err as Error).message} />
      </>
    );
  }

  return (
    <>
      <h1 className="a-h1">Sozlamalar</h1>
      <p className="a-sub">
        Narx va bot manzili — sakkiztala sahifada birdek. Pixel esa har sahifada alohida.
      </p>
      <SettingsForm values={values} />
      <BotLinkForm
        landings={LANDINGS.map(({ path, name, slug }) => ({ path, name, slug }))}
        values={botLinks}
        fallback={values.bot_username}
      />
      <PixelForm landings={LANDINGS.map(({ path, name, slug }) => ({ path, name, slug }))} values={pixels} />
    </>
  );
}
