import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleRoutes = [
  { prefix: '/admin', roles: ['school_admin', 'super_admin'] },
  { prefix: '/teacher', roles: ['teacher'] },
  { prefix: '/student', roles: ['student'] },
  { prefix: '/parent', roles: ['parent'] },
];

const publicPaths = ['/auth/login', '/auth/register', '/', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const role = request.cookies.get('userRole')?.value;
  if (!role) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const route = roleRoutes.find((routeItem) => pathname.startsWith(routeItem.prefix));
  if (!route) {
    return NextResponse.next();
  }

  if (!route.roles.includes(role)) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/student/:path*', '/parent/:path*'],
};