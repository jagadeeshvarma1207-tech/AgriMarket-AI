'use client'
import Link from 'next/link'
import { Leaf, Sparkles, ShieldCheck, MapPin, Star, ArrowRight, ChevronRight, Zap, Users, Package, TrendingUp, ShoppingBag } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(15,17,23,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)', height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>AgriMarket <span style={{ color: 'var(--color-primary-light)' }}>AI</span></span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(22,163,74,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.12) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(42,53,72,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(42,53,72,0.35) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', position: 'relative', width: '100%' }}>
          <div style={{ maxWidth: 720 }}>
            {/* Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
              <Sparkles size={14} color="var(--color-ai-light)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-ai-light)', fontWeight: 600 }}>Powered by AI Quality Assessment</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: 'var(--color-text)' }}>
              Farm Fresh.<br />
              <span className="gradient-text">AI Graded.</span><br />
              Direct to You.
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }}>
              Connect directly with local farmers. Get AI-graded produce quality assessments. Buy fresh fruits and vegetables with complete transparency.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/auth/register?role=CONSUMER" className="btn btn-primary btn-lg">
                Shop Fresh Produce <ArrowRight size={18} />
              </Link>
              <Link href="/auth/register?role=FARMER" className="btn btn-outline btn-lg">
                Sell Your Harvest <ChevronRight size={18} />
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
              {[{ icon: Users, value: 'Direct', label: 'Farmer to Consumer' }, { icon: Sparkles, value: 'AI', label: 'Quality Graded' }, { icon: ShieldCheck, value: 'Secure', label: 'Verified Marketplace' }].map((s) => (
                <div key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <s.icon size={18} color="var(--color-primary-light)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
              <Zap size={13} color="var(--color-primary-light)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>HOW IT WORKS</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>From Farm to Table</h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Three simple steps to get the freshest produce directly from farmers near you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: Users, title: 'Farmers List Products', desc: 'Local farmers create listings with photos, descriptions, prices, and location. AI quality assessment provides objective quality grades.', color: 'var(--color-primary)' },
              { step: '02', icon: Sparkles, title: 'AI Grades Quality', desc: 'Our AI system analyzes product images and assigns quality grades (A–D) with confidence scores. Transparent, objective, reliable.', color: 'var(--color-ai)' },
              { step: '03', icon: ShoppingBag, title: 'You Order Direct', desc: 'Browse, filter by quality, compare prices, and place orders directly with farmers. Pickup or delivery — your choice.', color: 'var(--color-accent)' },
            ].map((item) => (
              <div key={item.step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 900, color: `${item.color}15`, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>
                  {item.step}
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <item.icon size={24} color={item.color} />
                </div>
                <h4 style={{ marginBottom: 10, fontFamily: 'var(--font-display)' }}>{item.title}</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {/* For Farmers */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.1)', borderRadius: 999, padding: '4px 12px', marginBottom: 20, border: '1px solid rgba(22,163,74,0.2)' }}>
                <Leaf size={13} color="var(--color-primary-light)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>FOR FARMERS</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Grow Your Market. Reach More Customers.</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Create product listings with photos',
                  'AI quality assessment for your produce',
                  'Set your own prices and quantities',
                  'Manage orders from your phone',
                  'View ratings and customer feedback',
                  'Location-based customer discovery',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(22,163,74,0.2)', border: '1px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={11} color="var(--color-primary-light)" />
                    </div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/register?role=FARMER" className="btn btn-primary" style={{ marginTop: 28 }}>
                Start Selling <ArrowRight size={16} />
              </Link>
            </div>

            {/* For Consumers */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', borderRadius: 999, padding: '4px 12px', marginBottom: 20, border: '1px solid rgba(245,158,11,0.2)' }}>
                <ShoppingBag size={13} color="var(--color-accent)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>FOR CONSUMERS</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Freshest Produce. Best Prices. Zero Middlemen.</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Browse AI-graded fresh produce',
                  'Filter by quality grade, price, location',
                  'View farmer profiles and ratings',
                  'Place orders directly with farmers',
                  'Track order status in real time',
                  'Leave reviews and earn trust',
                ].map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Star size={11} color="var(--color-accent)" />
                    </div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/register?role=CONSUMER" className="btn btn-accent" style={{ marginTop: 28, color: 'white' }}>
                Start Shopping <ArrowRight size={16} />
              </Link>
            </div>

            {/* AI Feature */}
            <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(22,163,74,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16, padding: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(139,92,246,0.15)', borderRadius: 999, padding: '4px 12px', marginBottom: 20, border: '1px solid rgba(139,92,246,0.3)' }}>
                <Sparkles size={13} color="var(--color-ai-light)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-ai-light)', fontWeight: 600 }}>AI QUALITY SYSTEM</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Objective Quality. Every Image.</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.7 }}>
                Our AI model analyzes produce images to detect visual quality indicators. No fake ratings. Grade A through D with confidence scores.
              </p>
              {[
                { grade: 'A', label: 'Premium', color: 'var(--grade-a)' },
                { grade: 'B', label: 'Good', color: 'var(--grade-b)' },
                { grade: 'C', label: 'Fair', color: 'var(--grade-c)' },
                { grade: 'D', label: 'Poor', color: 'var(--grade-d)' },
              ].map((g) => (
                <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: `${g.color}20`, border: `2px solid ${g.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: g.color, flexShrink: 0 }}>
                    {g.grade}
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Grade {g.grade} — {g.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', textAlign: 'center', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(22,163,74,0.12) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, marginBottom: 20 }}>
            Ready to experience <span className="gradient-text">farm-fresh</span> food?
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 36, fontSize: '1rem' }}>
            Join as a farmer and reach more customers, or browse fresh produce directly from local growers.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register?role=CONSUMER" className="btn btn-primary btn-lg">
              Browse Marketplace <ArrowRight size={18} />
            </Link>
            <Link href="/marketplace" className="btn btn-ghost btn-lg">
              View Products First
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px 0', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Leaf size={18} color="var(--color-primary-light)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-secondary)' }}>AgriMarket AI</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
            © 2024 AgriMarket AI. Farm fresh, AI powered.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/marketplace" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Marketplace</Link>
            <Link href="/auth/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sign In</Link>
            <Link href="/auth/register" style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
