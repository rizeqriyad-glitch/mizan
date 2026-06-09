import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      direction: isAr ? 'rtl' : 'ltr',
      overflowX: 'hidden',
      position: 'relative',
    }}>
      {/* ── Volumetric Background Elements ─────────────────────── */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108, 71, 255, 0.12) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '0', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 201, 255, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '20%', right: '10%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108, 71, 255, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: '1px solid var(--v-glass-border)',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(30px)',
        padding: '0 2rem',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 0 8px rgba(238, 193, 109, 0.4))' }}>⚖️</span>
          <span style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)',
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
              border: '1px solid var(--v-glass-border)',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {isAr ? 'English' : 'العربية'}
          </button>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '12px',
              background: 'var(--mizan-gradient)',
              border: 'none',
              color: '#ffffff', fontSize: '0.85rem', cursor: 'pointer',
              fontWeight: 700,
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              boxShadow: '0 10px 20px rgba(108, 71, 255, 0.3)',
            }}>
            {user ? (isAr ? 'لوحة التحكم' : 'Dashboard') : t('landingStart')}
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '10rem 2rem 6rem',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Bismillah */}
          <p 
            data-reveal
            style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: '1.8rem',
            color: 'var(--mizan-purple)',
            marginBottom: '2rem',
            letterSpacing: '0.1em',
            opacity: 0.9,
            filter: 'drop-shadow(0 0 10px rgba(108, 71, 255, 0.3))',
          }}>
            بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>

          {/* App name */}
          <h1 
            data-reveal
            style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            marginBottom: '0.5rem',
            lineHeight: 1.1,
          }}>
            {isAr ? <span className="gradient-text">ميزان</span> : <span className="gradient-text">Mizan</span>}
          </h1>

          {/* Tagline */}
          <p 
            data-reveal
            style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)',
            color: 'var(--mizan-cyan)',
            marginBottom: '1.5rem',
            fontWeight: 700,
          }}>
            {t('landingHero')}
          </p>

          {/* Description */}
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            maxWidth: 620, margin: '0 auto 3rem',
            lineHeight: 1.75,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('landingSubtitle')}
          </p>

          {/* CTA */}
          <div data-reveal style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                className="btn-magnetic"
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                style={{
                  padding: '1rem 2.5rem',
                  borderRadius: '16px',
                  background: 'var(--mizan-gradient)',
                  color: '#ffffff',
                  fontWeight: 700, fontSize: '1rem',
                  border: 'none', cursor: 'pointer',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  boxShadow: '0 20px 40px rgba(108, 71, 255, 0.4)',
                }}>
                {t('landingStart')} →
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section data-reveal className="glass-card" style={{
        margin: '0 2rem',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        textAlign: 'center',
      }}>
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem', fontWeight: 800,
              color: 'var(--mizan-purple)', lineHeight: 1,
              marginBottom: '0.3rem',
              filter: 'drop-shadow(0 0 12px rgba(108, 71, 255, 0.2))',
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
      <section style={{ padding: '8rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 data-reveal style={{
            fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {t('landingFeatures')}
          </h2>
          <div style={{ width: 60, height: 3, background: 'var(--mizan-purple)', margin: '0 auto', borderRadius: 99, opacity: 0.8 }} />
        </motion.div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              data-reveal
              key={i}
              style={{
                padding: '2rem',
                borderRadius: '24px',
              }}
              className="glass-card"
            >
              <div 
                className="glass-icon-mizan"
                style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1.25rem' }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '1.1rem', fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {isAr ? f.ar : f.en}
              </h3>
              <p style={{
                fontSize: '0.9rem', color: 'var(--text-secondary)',
                lineHeight: 1.8, margin: 0,
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {f.desc[language] || f.desc.en}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section data-reveal className="glass-card" style={{
        margin: '0 2rem 4rem',
        padding: '6rem 2rem',
        textAlign: 'center',
        borderRadius: '40px',
        background: 'rgba(108, 71, 255, 0.03)',
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: '1.8rem',
            color: 'var(--mizan-purple)',
            marginBottom: '0.5rem',
            direction: 'rtl',
            opacity: 0.9,
          }}>
            وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            الذاريات: ٥٦
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ display: 'inline-block' }}>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              style={{
                padding: '1.2rem 3.5rem',
                borderRadius: '18px',
                background: 'var(--mizan-gradient)',
                color: '#ffffff',
                fontWeight: 700, fontSize: '1.1rem',
                border: 'none', cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
              {t('landingStart')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{
        padding: '3rem 2rem',
        borderTop: '1px solid var(--v-glass-border)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', zIndex: 1, position: 'relative',
        gap: '0.5rem',
      }}>
        <span style={{
          fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
          color: 'var(--mizan-purple)', fontSize: '1.2rem', fontWeight: 800,
          textAlign: isAr ? 'right' : 'left',
        }}>
          {isAr ? 'ميزان' : 'Mizan'}
        </span>
        <span style={{
          fontSize: '0.72rem', color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', fontWeight: 600,
          textAlign: 'center',
        }}>
          {isAr
            ? '© ١٤٤٦ هـ / ٢٠٢٥ م · ميزان · جميع الحقوق محفوظة'
            : '© 2025 Mizan · All rights reserved'}
        </span>
        <span style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          textAlign: isAr ? 'left' : 'right', fontWeight: 500,
        }}>
          {isAr ? 'التوازن في كل شيء' : 'Balance in All Things'}
        </span>
      </footer>

      <style>{`
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="gridTemplateColumns: repeat(auto-fill, minmax(340px, 1fr))"] { grid-template-columns: 1fr !important; }
        }
        .glass-card:hover {
          border-color: rgba(108, 71, 255, 0.4) !important;
          transform: translateY(-5px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
        }
        .btn-magnetic {
          transition: transform 0.2s var(--ease-spring);
        }
        .btn-magnetic:hover {
          transform: scale(1.05);
        }
        .gradient-text {
          background: var(--mizan-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 10px 20px rgba(108, 71, 255, 0.2));
        }
        * {
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  )
}
