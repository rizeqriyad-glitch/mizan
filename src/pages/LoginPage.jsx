import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import MizanMark from '../components/MizanMark'

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth()
  const { language, changeLanguage, t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error || 'Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  const isAr = language === 'ar'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      overflow: 'hidden',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      {/* Left decorative panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: '0 0 50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'var(--v-glass-bg)',
          borderRight: isAr ? 'none' : '1px solid var(--v-glass-border)',
          borderLeft: isAr ? '1px solid var(--v-glass-border)' : 'none',
          boxShadow: 'var(--v-shadow)',
        }}
        className="login-panel-hidden"
      >
        {/* Geometric Islamic pattern overlay */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        > {/* This pattern uses gold, which is not Mizan's primary. I will update it to use mizan-purple/cyan. */}
          <defs>
            <pattern id="islamic" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="none" stroke="var(--mizan-purple)" strokeWidth="1"/> {/* Mizan purple */}
              <polygon points="40,10 70,25 70,55 40,70 10,55 10,25" fill="none" stroke="var(--mizan-cyan)" strokeWidth="0.5"/> {/* Mizan cyan */}
              <line x1="40" y1="0" x2="40" y2="80" stroke="var(--mizan-purple)" strokeWidth="0.3"/> {/* Mizan purple */}
              <line x1="0" y1="40" x2="80" y2="40" stroke="var(--mizan-cyan)" strokeWidth="0.3"/> {/* Mizan cyan */}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic)"/>
        </svg>

        {/* Dawn-light orb */}
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 16%, transparent) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '3rem' }}>
          {/* Arabic Bismillah */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: '2rem',
              color: 'var(--mizan-purple)',
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              direction: 'rtl',
            }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
          </motion.div>

          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="glass-icon-mizan"
            style={{
              width: 90,
              height: 90,
              margin: '0 auto 2rem',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MizanMark size={54} animateIn={false} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            lang="ar"
            style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '3.5rem',
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              lineHeight: 1.4,
            }}
          >
            ميزان
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{
              fontFamily: 'var(--font-latin)',
              fontSize: '0.85rem',
              letterSpacing: '0.3em',
              color: 'var(--text-secondary)',
              marginBottom: '3rem',
            }}
          >
            MIZAN
          </motion.div>

          {/* Feature list */}
          {[
            { en: '5 Daily Prayers', ar: 'الصلوات الخمس' },
            { en: 'Quran & Adhkar', ar: 'القرآن والأذكار' },
            { en: 'Deep Work Focus', ar: 'التركيز العميق' },
            { en: 'Habit Tracking', ar: 'تتبع العادات' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                marginBottom: '0.75rem',
                justifyContent: 'center',
              }}
            > {/* Update bullet color */}
              <span style={{ color: 'var(--mizan-cyan)', fontSize: '0.5rem' }}>◆</span>
              <span>{isAr ? item.ar : item.en}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right - Sign in form */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
        }}
      >
        {/* Language toggle top right */}
        <div style={{ position: 'absolute', top: '2rem', right: isAr ? 'auto' : '2rem', left: isAr ? '2rem' : 'auto' }}>
          <button
            onClick={() => changeLanguage(isAr ? 'en' : 'ar')}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              border: '1px solid var(--v-glass-border)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            {isAr ? 'English' : 'العربية'}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 style={{
              fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: isAr ? '2rem' : '2.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              textAlign: isAr ? 'right' : 'left',
            }}>
              {t('signInTitle')}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              marginBottom: '2.5rem',
              textAlign: isAr ? 'right' : 'left',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {t('signInSubtitle')}
            </p>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255,0,0,0.1)',
                border: '1px solid rgba(255,0,0,0.2)',
                color: 'var(--ruby)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                textAlign: isAr ? 'right' : 'left',
              }}>
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn-magnetic"
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                borderRadius: '14px',
                background: 'var(--mizan-gradient)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all var(--transition)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              {loading ? (
                <div style={{
                  width: 20, height: 20,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid var(--mizan-cyan)',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {t('signInWithGoogle')}
            </motion.button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '2rem 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>✦</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Hadith */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'var(--v-glass-bg)',
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-arabic)',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                direction: 'rtl',
                marginBottom: '0.5rem',
              }}>
                {t('motivationalQuote')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('quoteSource')}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-panel-hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
