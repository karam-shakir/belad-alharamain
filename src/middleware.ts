import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'belad_admin_session';

async function isLoggedIn(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ['HS256'] },
    );
    return payload.sub === 'admin';
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const ok = await isLoggedIn(token);

  // Already logged in → bounce away from login page
  if (pathname === '/admin/login' && ok) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Protect /admin (everything except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !ok) {
    const url = new URL('/admin/login', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
