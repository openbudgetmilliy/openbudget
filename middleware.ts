import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE, readToken } from './lib/jwt';

/**
 * Admin panel himoyasi.
 *
 * Ilgari bu yerda ikkinchi vazifa ham bor edi — `/l` landing'ini `gt`
 * cookie'si bilan to'sish. Kirish darvozasi olib tashlangach (tekshiruv endi
 * asosiy sahifada FONDA ishlaydi, `components/BackgroundGate.tsx`) u kerak
 * emas: landing hammaga ochiq va Cloudflare edge'da cache'lanadi.
 *
 * MUHIM: `matcher` faqat `/admin/*` ni tutadi. Landing sahifalari, statik
 * fayllar va API middleware'ga UMUMAN kirmaydi — aks holda har bir so'rov
 * Node'ga tushib, edge cache'ning ma'nosi qolmasdi.
 */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLogin = pathname === '/admin/login';
  const admin = await readToken(req.cookies.get(COOKIE)?.value);

  if (!admin && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (admin && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
