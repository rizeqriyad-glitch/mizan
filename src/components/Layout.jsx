import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import AdhanNotifier from './AdhanNotifier'
import ReminderNotifier from './ReminderNotifier'
import MizanMark from './MizanMark'

function DigitalClock({ timeFormat, isAr }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds()
  let timeStr
  if (timeFormat === '24h') {
    timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  } else {
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12  = h % 12 || 12
    timeStr = `${h12}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`
  }

  const dateStr = now.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })

  return (
    <div style={{ textAlign: isAr ? 'right' : 'left' }}>
      <div style={{
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.02em',
      }}>
        {timeStr}
      </div>
      <div style={{
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        marginTop: '0.1rem',
        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
      }}>
        {dateStr}
      </div>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { language, theme, changeTheme, timeFormat, t } = useApp()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAr = language === 'ar'

  const navItems = [
    { to: '/dashboard',            icon: '◈', label: t('dashboard'),  exact: true },
    { to: '/dashboard/planner',    icon: '◧', label: t('planner') },
    { to: '/dashboard/notes',      icon: '◫', label: t('notes') },
    { to: '/dashboard/history',    icon: '⏳', label: t('dayHistoryTitle') },
    { to: '/dashboard/analytics',  icon: '◉', label: t('analytics') },
    { to: '/dashboard/settings',   icon: '◎', label: t('settings') },
    { to: '/',                     icon: '◇', label: t('about') },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
              display: 'none',
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        style={{
          width: 240,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          borderRight: isAr ? 'none' : '1px solid var(--border)',
          borderLeft: isAr ? '1px solid var(--border)' : 'none',
          zIndex: 50,
          overflowY: 'auto',
        }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{
          padding: '1.75rem 1.5rem 1.25rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MizanMark size={38} />
            <div>
              <div style={{
                fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800, // Mizan token for display font
                color: 'var(--mizan-purple)', // Mizan purple color
                letterSpacing: '0.04em',
              }}>
                {isAr ? 'ميزان' : 'Mizan'}
              </div>
            </div>
          </div>
        </div>

        {/* User profile */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(108,71,255,0.1)', display: 'flex', // Mizan purple background
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--mizan-purple)', fontWeight: 600, fontSize: '0.85rem', // Mizan purple color
              }}> {/* User initial icon */}
                {user?.displayName?.[0] || user?.email?.[0] || '?'}
              </div>
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.displayName || 'User'}
              </div>
              <div style={{
                fontSize: '0.7rem', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.25rem',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive ? 'var(--gold-dim)' : 'transparent',
                border: isActive ? '1px solid rgba(108,71,255,0.15)' : '1px solid transparent', // Mizan purple border
                transition: 'all var(--transition)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', // Keep font family
              })}
            >
              <span aria-hidden="true" style={{ fontSize: '1rem', opacity: 0.8 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Digital clock */}
        <div style={{
          padding: '0.875rem 1.5rem',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          <DigitalClock timeFormat={timeFormat} isAr={isAr} />
        </div>

        {/* Bottom actions */}
        <div style={{
          padding: '0.75rem',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {/* Theme toggle */}
          <button
            onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? t('lightMode') : t('darkMode')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              background: 'transparent',
              border: '1px solid transparent',
              transition: 'all var(--transition)',
              width: '100%',
              textAlign: isAr ? 'right' : 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {theme === 'dark' ? t('lightMode') : t('darkMode')}
            </span>
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              background: 'transparent',
              border: '1px solid transparent',
              transition: 'all var(--transition)',
              width: '100%',
              textAlign: isAr ? 'right' : 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ruby-dim)'; e.currentTarget.style.color = 'var(--ruby)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <span aria-hidden="true">↩</span>
            <span style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{t('signOut')}</span>
          </button>

          {/* Copyright */}
          <div style={{
            paddingTop: '0.5rem',
            marginTop: '0.25rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            opacity: 0.7,
          }}>
            {isAr ? '© ٢٠٢٥ ميزان · جميع الحقوق محفوظة' : '© 2025 Mizan · All rights reserved'}
          </div>
        </div>
      </motion.aside>

      {/* Adhan notification — renders as a fixed overlay, lives outside scroll flow */}
      <AdhanNotifier />
      <ReminderNotifier />

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {/* Mobile header */}
        <div className="mobile-header" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label={isAr ? 'فتح القائمة' : 'Open menu'}
            aria-expanded={sidebarOpen}
            style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', background: 'none', border: 'none' }}
          >
            <span aria-hidden="true">☰</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MizanMark size={28} animateIn={false} />
            <span style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)', color: 'var(--mizan-purple)', fontSize: '1.15rem', fontWeight: 700 }}>
              {isAr ? 'ميزان' : 'Mizan'}
            </span>
          </div>
          <div style={{ width: 28 }} />
        </div>

        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            ${isAr ? 'right: 0 !important; left: auto !important;' : 'left: 0 !important; right: auto !important;'}
            transform: translateX(${sidebarOpen ? '0' : (isAr ? '100%' : '-100%')});
            transition: transform 0.3s ease;
            height: 100vh !important;
          }
          .mobile-header { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  )
}
