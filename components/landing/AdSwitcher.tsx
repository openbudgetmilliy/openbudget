import a from './adscreen.module.css';

/**
 * Variant almashtirgich — reklama ekranlari (`/2`–`/5`) uchun.
 *
 * `/1`, `/6`–`/9` da almashtirgich har bir variantning O'Z uslubida
 * bo'yalgan (u yerda u sahifa dizaynining bir qismi). Bitta ekranli
 * reklama kadrlarida esa u aksincha — ko'zga tashlanmasligi kerak:
 * neytral to'q pill, bir xil, hamma to'rttasida.
 */
const VARIANTS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export default function AdSwitcher({ current }: { current: string }) {
  return (
    <nav className={a.switcher} aria-label="Dizayn variantlari">
      {VARIANTS.map((n) => (
        <a
          key={n}
          href={`/${n}`}
          className={n === current ? a.swOn : undefined}
          aria-current={n === current ? 'page' : undefined}
        >
          {n}
        </a>
      ))}
      <a href="/l">asl</a>
    </nav>
  );
}
