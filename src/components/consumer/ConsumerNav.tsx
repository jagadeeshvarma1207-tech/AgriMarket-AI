'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home, Search, Grid3X3, MapPin, ShoppingBag,
  Heart, Star, User, LogOut, Menu, Leaf, X
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import LanguageSelector from '@/components/ui/LanguageSelector'

const NAV_ITEMS = [
  { label: 'Home', href: '/consumer', icon: Home },
  { label: 'Browse', href: '/consumer/browse', icon: Grid3X3 },
  { label: 'Search', href: '/consumer/search', icon: Search },
  { label: 'Categories', href: '/consumer/categories', icon: Grid3X3 },
  { label: 'Nearby', href: '/consumer/nearby', icon: MapPin },
  { label: 'My Orders', href: '/consumer/orders', icon: ShoppingBag },
  { label: 'Favorites', href: '/consumer/favorites', icon: Heart },
  { label: 'Reviews', href: '/consumer/reviews', icon: Star },
  { label: 'Profile', href: '/consumer/profile', icon: User },
]

export function ConsumerNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
        height: '64px', display: 'flex', alignItems: 'center',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '24px', maxWidth: '100%', padding: '0 24px' }}>
          {/* Logo */}
          <Link href="/consumer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
              AgriMarket
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', gap: '4px', flex: 1, alignItems: 'center' }} className="desktop-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              // Convert label to translation key
              let tKey = 'nav.' + item.label.toLowerCase().replace(' ', '')
              if (item.label === 'My Orders') tKey = 'nav.orders'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                    background: isActive ? 'rgba(22,163,74,0.12)' : 'none',
                    fontSize: '0.85rem', fontWeight: 500,
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={15} />
                  <span className="nav-label">{t(tKey, item.label)}</span>
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'none' }} className="desktop-only">
              Hi, {session?.user?.name?.split(' ')[0]}
            </span>
            <LanguageSelector />
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={15} />
              <span className="desktop-only">{t('nav.signOut', 'Sign out')}</span>
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: 64, background: 'var(--color-bg-secondary)',
          zIndex: 45, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            let tKey = 'nav.' + item.label.toLowerCase().replace(' ', '')
            if (item.label === 'My Orders') tKey = 'nav.orders'
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px',
                  color: 'var(--color-text)', fontSize: '1rem', fontWeight: 500,
                  textDecoration: 'none',
                  background: pathname === item.href ? 'rgba(22,163,74,0.15)' : 'none',
                }}
              >
                <Icon size={20} />
                {t(tKey, item.label)}
              </Link>
            )
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .nav-label { display: none; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}
