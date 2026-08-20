import { getSettings } from '@/lib/data';
import { tgLink } from '@/lib/tg';
import { env } from '@/lib/env';
import { Telegram } from '@/components/Icons';

export const metadata = { title: 'Sahifa topilmadi', robots: { index: false } };

/**
 * Bot manzili shu yerda ham SOZLAMADAN olinadi. Ilgari `env.BOT` turardi va
 * bot almashganda 404 sahifasidagi tugma eski botga olib borardi — eng
 * sezilmaydigan, shuning uchun eng uzoq yashaydigan xato.
 */
export default async function NotFound() {
  const s = await getSettings();
  return (
    <main className="nf">
      <div className="wrap">
        <span className="eyebrow">404</span>
        <h1 className="nf-title">Bu sahifa topilmadi</h1>
        <p className="nf-sub">
          Havola eskirgan bo’lishi mumkin. To’g’ridan-to’g’ri botga o’tishingiz mumkin.
        </p>

        <div className="btn-row nf-cta">
          <a href="/" className="btn btn-ghost">
            Bosh sahifa
          </a>
          <a href={tgLink(s.bot_username || env.BOT, 'web_404')} className="btn btn-primary" rel="noopener">
            <Telegram />
            Botga o’tish
          </a>
        </div>
      </div>
    </main>
  );
}
