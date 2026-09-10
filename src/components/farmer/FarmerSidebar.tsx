'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Package, PlusCircle, Sparkles, ShoppingBag,
  MessageSquare, MapPin, Star, User, Settings, LogOut,
  ChevronLeft, Menu, Leaf
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/farmer/dashboard', icon: LayoutDashboard },
  { label: 'My Products', href: '/farmer/products', icon: Package },
  { label: 'Add Product', href: '/farmer/products/new', icon: PlusCircle },
  { label: 'AI Quality Check', href: '/farmer/ai-quality', icon: Sparkles },
  { label: 'Orders', href: '/farmer/orders', icon: ShoppingBag },
  { label: 'Messages', href: '/farmer/messages', icon: MessageSquare },
  { label: 'Location', href: '/farmer/location', icon: MapPin },
  { label: 'Reviews', href: '/farmer/reviews', icon: Star },
  { label: 'Profile', href: '/farmer/profile', icon: User },
  { label: 'Settings', href: '/farmer/settings', icon: Settings },
]

export function FarmerSidebar({ unreadMessages = 0, pendingOrders = 0 }: { unreadMessages?: number; pendingOrders?: number }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const badges: Record<string, number> = {
    '/farmer/messages': unreadMessages,
    '/farmer/orders': pendingOrders,
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ position: 'fixed', top: 14, left: 16, zIndex: 60, display: 'none' }}
        id="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 55 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>
              AgriMarket
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
              FARMER
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/farmer/dashboard' && pathname.startsWith(item.href))
            const badge = badges[item.href]
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {badge && badge > 0 ? (
                  <span className="sidebar-nav-badge">{badge}</span>
                ) : item.href === '/farmer/ai-quality' ? (
                  <span className="badge badge-purple" style={{ marginLeft: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.6rem' }}>AI</span>
                ) : null}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '8px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-ai))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {session?.user.name?.charAt(0).toUpperCase() || 'F'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Farmer</div>
            </div>
          </div>
          <button
            className="sidebar-nav-item"
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ color: 'var(--color-danger)', width: '100%' }}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
