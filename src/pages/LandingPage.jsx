import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, MotionConfig } from 'motion/react'
import {
  CheckCircle, Sparkles, BookOpen, Repeat, Timer, PenLine,
  Sun, Moon, ArrowLeft, ArrowRight,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import MizanHero from '../components/MizanHero'
import MizanMark from '../components/MizanMark'

/* Featured pair gets card treatment; the rest are compact rows (no cloned grids). */
const FEATURED = [
  {
    Icon: CheckCircle,
    en: 'Prayer tracking', ar: 'تتبع الصلوات الخمس',
    desc: {
      en: 'Log each prayer with one tap and watch your scale settle as the day completes.',
      ar: 'سجّل كل صلاة بنقرة واحدة، وشاهد ميزانك يعتدل كلما اكتمل يومك.',
    },
  },
  {
    Icon: Sparkles,
    en: 'Morning & evening adhkar', ar: 'أذكار الصباح والمساء',
    desc: {
      en: '23 authentic adhkar from Hisn al-Muslim, with their sources, checked off as you go.',
      ar: '٢٣ ذكرًا صحيحًا من حصن المسلم، بمصادرها، تُعلَّم عند الإتمام.',
    },
  },
]

const FEATURE_ROWS = [
  {
    Icon: BookOpen,
    en: 'Daily Quran', ar: 'وردك اليومي',
    desc: { en: 'Read in the Uthmanic script with a trusted translation.', ar: 'اقرأ بالرسم العثماني مع ترجمة موثوقة.' },
  },
  {
    Icon: Repeat,
    en: 'Dhikr counter', ar: 'عدّاد الذكر',
    desc: { en: 'Resets at Fajr, keeps your progress.', ar: 'يُصفَّر كل فجر ويحفظ تقدمك.' },
  },
  {
    Icon: Timer,
    en: 'Focus sessions', ar: 'جلسات تركيز',
    desc: { en: 'Deep work between the adhans, Pomodoro style.', ar: 'عمل عميق بين الأذانين بنمط بومودورو.' },
  },
  {
    Icon: PenLine,
    en: 'Notes & learnings', ar: 'فوائد وملاحظات',
    desc: { en: 'Capture verses, hadiths and what you learn.', ar: 'قيّد الآيات والأحاديث وما تتعلمه.' },
  },
]

const STATS = [
  { value: 5, label: { en: 'daily prayers', ar: 'صلوات يومية' } },
  { value: 23, label: { en: 'morning adhkar', ar: 'ذكرًا صباحيًا' } },
  { value: 114, label: { en: 'Quran surahs', ar: 'سورة قرآنية' } },
]

const wrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 26 },
  },
}

export default function LandingPage() {
  const { language, changeLanguage, theme, changeTheme, t, completedToday } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAr = language === 'ar'
  const Forward = isAr ? ArrowLeft : ArrowRight
  const nf = new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US')

  // Gate the entrance on fonts (FOUT-proof) but never longer than 800ms.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let on = true
    const tm = setTimeout(() => on && setReady(true), 800)
    document.fonts?.ready?.then(() => on && setReady(true))
    return () => { on = false; clearTimeout(tm) }
  }, [])

  // Scroll reveal for below-the-fold sections
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) }
    }), { threshold: 0.15, rootMargin: '0px 0px -60px 0px' })
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [language])

  // Magnetic primary CTA — pointer devices, motion allowed
  const ctaRef = useRef(null)
  useEffect(() => {
    const el = ctaRef.current
    if (!el || !matchMedia('(hover:hover) and (prefers-reduced-motion: no-preference)').matches) return
    const move = (e) => {
      const r = el.getBoundingClientRect()
      el.style.translate =
        `${(e.clientX - r.x - r.width / 2) * 0.22}px ${(e.clientY - r.y - r.height / 2) * 0.22}px`
    }
    const leave = () => { el.style.translate = '0px 0px' }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])

  const goStart = () => navigate(user ? '/dashboard' : '/login')

  const toggleTheme = () => {
    document.documentElement.classList.add('theming')
    changeTheme(theme === 'dark' ? 'light' : 'dark')
    setTimeout(() => document.documentElement.classList.remove('theming'), 300)
  }

  const onBrandClick = (e) => {
    e.preventDefault()
    const a = e.currentTarget
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      a.classList.add('is-pressed')
      setTimeout(() => a.classList.remove('is-pressed'), 300)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <a href="#main" className="skip-link">
          {isAr ? 'تجاوز إلى المحتوى' : 'Skip to content'}
        </a>

        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className="ld-nav" aria-label={isAr ? 'الرئيسية' : 'Primary'}>
          <div className="ld-nav-inner">
            <a href="/" className="brand" aria-label="ميزان — الصفحة الرئيسية" onClick={onBrandClick}>
              <MizanMark size={30} animateIn={false} />
              <span className="brand__name">ميزان</span>
            </a>
            <div className="ld-nav-actions">
              <button
                type="button"
                className="btn-ui"
                onClick={toggleTheme}
                aria-label={theme === 'dark'
                  ? (isAr ? 'الوضع الفاتح' : 'Switch to light theme')
                  : (isAr ? 'الوضع الداكن' : 'Switch to dark theme')}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button type="button" className="btn-ui" onClick={() => changeLanguage(isAr ? 'en' : 'ar')}>
                {isAr ? 'EN' : 'عربي'}
              </button>
              <button type="button" className="btn-cta btn-cta--sm" onClick={goStart}>
                {user ? (isAr ? 'لوحة التحكم' : 'Dashboard') : t('landingStart')}
              </button>
            </div>
          </div>
        </nav>

        <main id="main">
          {/* ── Hero ──────────────────────────────────────── */}
          <section className="ld-hero">
            <MizanHero completed={completedToday?.length ?? 0} total={5} />
            <motion.div
              className="ld-hero-content"
              variants={wrap}
              initial="hidden"
              animate={ready ? 'show' : 'hidden'}
            >
              <motion.p variants={item} className="ld-bismillah" lang="ar" dir="rtl">
                بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ
              </motion.p>
              <motion.h1 variants={item} className="ld-h1">
                <span className="ld-h1-name" lang="ar">ميزان</span>
                <span className="ld-h1-tag">{t('landingHero')}</span>
              </motion.h1>
              <motion.p variants={item} className="ld-sub">
                {t('landingSubtitle')}
              </motion.p>
              <motion.div variants={item} className="ld-cta-row">
                <button type="button" ref={ctaRef} className="btn-cta" onClick={goStart}
                  style={{ transition: 'translate .35s var(--ease-spring)' }}>
                  {t('landingStart')}
                  <Forward size={18} aria-hidden="true" />
                </button>
                <a className="btn-ghost" href="#features">{t('landingSeeFeatures')}</a>
              </motion.div>
            </motion.div>
          </section>

          {/* ── Stats ─────────────────────────────────────── */}
          <div className="ld-stats" data-reveal>
            {STATS.map((s, i) => (
              <div className="ld-stat" key={i}>
                <div className="ld-stat-num">{nf.format(s.value)}</div>
                <div className="ld-stat-label">{s.label[language] || s.label.en}</div>
              </div>
            ))}
          </div>

          {/* ── Features ──────────────────────────────────── */}
          <section id="features" className="ld-section" aria-labelledby="features-h">
            <div className="ld-section-head" data-reveal>
              <h2 id="features-h">{t('landingFeatures')}</h2>
              <p>{t('landingFeaturesSub')}</p>
            </div>

            <div className="ld-feature-grid">
              {FEATURED.map((f, i) => (
                <article className="ld-feature-card" data-reveal key={i}>
                  <span className="ld-icon"><f.Icon size={20} aria-hidden="true" /></span>
                  <h3>{isAr ? f.ar : f.en}</h3>
                  <p>{f.desc[language] || f.desc.en}</p>
                </article>
              ))}
            </div>

            <div className="ld-feature-list">
              {FEATURE_ROWS.map((f, i) => (
                <div className="ld-feature-row" data-reveal key={i}>
                  <span className="ld-icon"><f.Icon size={18} aria-hidden="true" /></span>
                  <div className="ld-row-text">
                    <h3>{isAr ? f.ar : f.en}</h3>
                    <p>{f.desc[language] || f.desc.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Verse + final CTA ─────────────────────────── */}
          <section className="ld-verse" data-reveal>
            <p className="ld-verse-text" lang="ar">
              وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ
            </p>
            <p className="ld-verse-source">{isAr ? 'الذاريات: ٥٦' : 'Adh-Dhariyat 51:56'}</p>
            <button type="button" className="btn-cta" onClick={goStart}>
              {t('landingStart')}
              <Forward size={18} aria-hidden="true" />
            </button>
          </section>
        </main>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="ld-footer">
          <div className="ld-footer-inner">
            <span className="brand" style={{ gap: '.45rem' }}>
              <MizanMark size={22} animateIn={false} />
              <span className="brand__name" style={{ fontSize: '1.15rem' }}>ميزان</span>
            </span>
            <span className="ld-footer-copy">
              {isAr
                ? '© ١٤٤٧ هـ / ٢٠٢٦ م · ميزان · جميع الحقوق محفوظة'
                : '© 2026 Mizan · All rights reserved'}
            </span>
            <span className="ld-footer-tag">
              {isAr ? 'التوازن في كل شيء' : 'Mizan — Balance in All Things'}
            </span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
