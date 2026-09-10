import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // ─── FARMER ROUTES ─────────────────────────────────────────────────────
    if (pathname.startsWith('/farmer')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + pathname, req.url))
      }
      if (token.role !== 'FARMER') {
        return NextResponse.redirect(new URL('/consumer', req.url))
      }
    }

    // ─── CONSUMER ROUTES ───────────────────────────────────────────────────
    if (pathname.startsWith('/consumer')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + pathname, req.url))
      }
      if (token.role !== 'CONSUMER') {
        return NextResponse.redirect(new URL('/farmer/dashboard', req.url))
      }
    }

    // ─── AUTH PAGES (redirect if already logged in) ────────────────────────
    if (pathname.startsWith('/auth/')) {
      if (token) {
        if (token.role === 'FARMER') {
          return NextResponse.redirect(new URL('/farmer/dashboard', req.url))
        }
        return NextResponse.redirect(new URL('/consumer', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Allow public pages
        if (
          pathname === '/' ||
          pathname.startsWith('/marketplace') ||
          pathname.startsWith('/product/') ||
          pathname.startsWith('/farmer-profile/') ||
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname.startsWith('/uploads/') ||
          pathname.includes('.')
        ) {
          return true
        }
        // Auth pages — allow regardless
        if (pathname.startsWith('/auth/')) return true
        // Protected pages require token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
}
