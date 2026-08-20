import { pixelsFor } from '@/lib/pixels';

/**
 * Sahifaning Meta Pixel kodi.
 *
 * Har landing o'zini chaqiradi: `<MetaPixel path="/3" />`. Root layout'da
 * turolmaydi, chunki u qaysi sahifa ochilganini bilmaydi — pixel esa har
 * sahifada boshqa bo'lishi mumkin (`lib/pixels.ts`).
 *
 * Skript INLINE va sahifaning eng boshida turadi: tashqi fayl kutmaydi,
 * `fbq` darhol yaratiladi va PageView birinchi kadrdayoq navbatga tushadi.
 * `connect.facebook.net` ga ulanish esa root layout'dagi `preconnect`
 * orqali allaqachon ochilgan bo'ladi.
 *
 * ID topilmasa komponent HECH NARSA chizmaydi — lokal ishda ham, pixel
 * ulanmagan sahifada ham Meta'ga bitta so'rov ketmaydi.
 */
export default async function MetaPixel({ path }: { path: string }) {
  const ids = await pixelsFor(path);
  if (!ids.length) return null;

  const snippet =
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
    ids.map((id) => `fbq('init','${id}');`).join('') +
    `fbq('track','PageView');`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: snippet }} />
      <noscript>
        {ids.map((id) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={id}
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        ))}
      </noscript>
    </>
  );
}
