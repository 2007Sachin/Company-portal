import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('pulse_token')?.value;
  const role = request.cookies.get('pulse_role')?.value;

  const isRecruiterRoute = pathname.startsWith('/recruiter');
  const isCandidateRoute =
    pathname.startsWith('/candidate') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding');

  const isAuthRoute =
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/profile/public') ||
    pathname.startsWith('/admin');

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isRecruiterRoute && role !== 'recruiter') {
    return NextResponse.redirect(new URL('/candidate/dashboard', request.url));
  }

  if (isCandidateRoute && role !== 'candidate') {
    return NextResponse.redirect(new URL('/recruiter/search', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
