import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'

const FEATURES = [
  { icon: '🕌', en: 'Prayer Tracker', ar: 'تتبع الصلوات',  desc: { en: 'Log all 5 daily prayers with one tap and track your consistency over time.', ar: 'سجّل صلواتك الخمس اليومية بنقرة واحدة وتابع انتظامك.' } },
  { icon: '🤲', en: 'Morning & Evening Adhkar', ar: 'أذكار الصباح والمساء', desc: { en: 'Authentic supplications from Hisn al-Muslim with source references and checkmarks.', ar: 'أذكار صحيحة من حصن المسلم مع مراجعها وإمكانية التأشير.' } },
  { icon: '📖', en: 'Quran Reader', ar: 'قارئ القرآن', desc: { en: 'Read the Quran in the Uthmanic script with Sahih International translation.', ar: 'اقرأ القرآن بالرسم العثماني مع ترجمة موثوقة.' } },
  { icon: '📿', en: 'Daily Dhikr', ar: 'أذكار يومية', desc: { en: 'Count your daily remembrance with progress tracking that resets each morning.', ar: 'عدّ أذكارك اليومية مع تتبع التقدم الذي يُعاد صفره كل صباح.' } },
  { icon: '⏱', en: 'Focus Timer', ar: 'مؤقت التركيز', desc: { en: 'Pomodoro-style deep work sessions to boost your productivity between prayers.', ar: 'جلسات عمل عميق على نمط بومودورو لتعزيز إنتاجيتك.' } },
  { icon: '📝', en: 'Notes & Learnings', ar: 'ملاحظات وفوائد', desc: { en: 'Record Quranic insights, hadiths and anything you want to remember forever.', ar: 'سجّل الفوائد والآيات والأحاديث وكل ما تريد تذكّره.' } },
]

const STATS = [
  { value: '5',   label: { en: 'Daily Prayers', ar: 'صلوات يومية' } },
  { value: '23',  label: { en: 'Morning Adhkar', ar: 'ذكر صباحي' } },
  { value: '114', label: { en: 'Quran Surahs', ar: 'سورة قرآنية' } },
  { value: '∞',   label: { en: 'Rewards', ar: 'أجر لا يُحصى' } },
]

export default function LandingPage() {
  const { language, changeLanguage, t } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAr = language === 'ar'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      direction: isAr ? 'rtl' : 'ltr',
      overflowX: 'hidden',
    }}>
      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-base)',
        backdropFilter: 'blur(12px)',
        padding: '0 2rem',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⚖️</span>
          <span style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: '1.3rem', fontWeight: 600, color: 'var(--gold)',
            letterSpacing: '0.04em',
          }}>
            {isAr ? 'ميزان' : 'Mizan'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => changeLanguage(isAr ? 'en' : 'ar')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            {isAr ? 'English' : 'العربية'}
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            style={{
              padding: '0.4rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gold-dim)',
              border: '1px solid rgba(212,175,106,0.3)',
              color: 'var(--gold)', fontSize: '0.82rem', cursor: 'pointer',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}
          >
            {user ? (isAr ? 'لوحة التحكم' : 'Dashboard') : t('landingStart')}
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: '6rem 2rem 5rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background orb */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,106,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Islamic pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }} viewBox="0 0 400 400">
          <defs>
            <pattern id="lp-pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="none" stroke="var(--gold)" strokeWidth="1"/>
              <polygon points="40,10 70,25 70,55 40,70 10,55 10,25" fill="none" stroke="var(--gold)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-pat)"/>
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative' }}
        >
          {/* Bismillah */}
          <p style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: '1.4rem',
            color: 'var(--gold)',
            marginBottom: '2rem',
            letterSpacing: '0.05em',
            opacity: 0.85,
          }}>
            بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          {/* App name */}
          <h1 style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            marginBottom: '0.5rem',
            lineHeight: 1.1,
          }}>
            {isAr ? 'ميزان' : 'Mizan'}
          </h1>

          {/* Tagline */}
          <p style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
            color: 'var(--gold)',
            marginBottom: '1.25rem',
          }}>
            {t('landingHero')}
          </p>

          {/* Description */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            maxWidth: 560, margin: '0 auto 2.5rem',
            lineHeight: 1.75,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('landingSubtitle')}
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--gold)',
                  color: 'var(--text-inverse)',
                  fontWeight: 600, fontSize: '0.95rem',
                  border: 'none', cursor: 'pointer',
                  transition: 'opacity var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}>
                {t('landingStart')} →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
      }}
        className="landing-stats"
      >
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem', fontWeight: 600,
              color: 'var(--gold)', lineHeight: 1,
              marginBottom: '0.3rem',
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '0.8rem', color: 'var(--text-muted)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {s.label[language] || s.label.en}
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Features grid ─────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {t('landingFeatures')}
          </h2>
          <div style={{ width: 40, height: 2, background: 'var(--gold)', margin: '0 auto', borderRadius: 2, opacity: 0.6 }} />
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                transition: 'border-color var(--transition), transform var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(212,175,106,0.3)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--gold-dim)',
                border: '1px solid rgba(212,175,106,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '1rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '1rem', fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {isAr ? f.ar : f.en}
              </h3>
              <p style={{
                fontSize: '0.83rem', color: 'var(--text-secondary)',
                lineHeight: 1.7, margin: 0,
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {f.desc[language] || f.desc.en}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <p style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: '1.5rem',
            color: 'var(--gold)',
            marginBottom: '0.5rem',
            direction: 'rtl',
            opacity: 0.9,
          }}>
            وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            الذاريات: ٥٦
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-block' }}>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              style={{
                padding: '0.8rem 2.5rem',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gold)',
                color: 'var(--text-inverse)',
                fontWeight: 600, fontSize: '1rem',
                border: 'none', cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
              {t('landingStart')}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--border)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{
          fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
          color: 'var(--gold)', fontSize: '1.1rem',
          textAlign: isAr ? 'right' : 'left',
        }}>
          {isAr ? 'ميزان' : 'Mizan'}
        </span>
        <span style={{
          fontSize: '0.72rem', color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          textAlign: 'center',
        }}>
          {isAr
            ? '© ١٤٤٦ هـ / ٢٠٢٥ م · ميزان · جميع الحقوق محفوظة'
            : '© 2025 Mizan · All rights reserved'}
        </span>
        <span style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          textAlign: isAr ? 'left' : 'right',
        }}>
          {isAr ? 'التوازن في كل شيء' : 'Balance in All Things'}
        </span>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          .landing-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
