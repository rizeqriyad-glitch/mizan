import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { glyph } from '../components/glyphs'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useApp, FIXED_SECTIONS } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { getTodayKey } from '../utils/dateUtils'

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      labelAr: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
    })
  }
  return days
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { stats } = useApp()
  const { language, t } = useI18n()
  const isAr = language === 'ar'

  const [weekData, setWeekData]     = useState([])
  const [prayerData, setPrayerData] = useState({})
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const days = getLast7Days()

      // Fetch tasks for each day
      const weeklyData = await Promise.all(days.map(async (day) => {
        const q = query(
          collection(db, 'users', user.uid, 'tasks'),
          where('date', '==', day.key)
        )
        const snap = await getDocs(q)
        const all = snap.docs.map(d => d.data())
        const done = all.filter(t => t.completed)
        return { ...day, total: all.length, done: done.length }
      }))
      setWeekData(weeklyData)

      // Fetch prayer completions for this week
      const prayerMap = {}
      await Promise.all(days.map(async (day) => {
        try {
          const { getDoc, doc } = await import('firebase/firestore')
          const snap = await getDoc(doc(db, 'users', user.uid, 'prayers', day.key))
          if (snap.exists()) prayerMap[day.key] = snap.data()
        } catch {}
      }))
      setPrayerData(prayerMap)
      setLoading(false)
    }
    load()
  }, [user])

  const totalDone  = weekData.reduce((acc, d) => acc + d.done, 0)
  const totalTasks = weekData.reduce((acc, d) => acc + d.total, 0)
  const maxDone    = Math.max(...weekData.map(d => d.done), 1)

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const prayerLabels = {
    en: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' },
    ar: { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' },
  }
  const days = getLast7Days()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--v-glass-border)', borderTop: '2px solid var(--mizan-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 1000,
      direction: isAr ? 'rtl' : 'ltr',
    }}
    className="analytics-padding"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
          fontSize: isAr ? '2rem' : '2.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.35rem',
        }}>
          {t('analytics')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          {isAr ? 'نظرة عامة على أداءك الأسبوعي' : 'Your weekly performance overview'}
        </p>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }} className="analytics-grid">
        {[
          { label: isAr ? 'المهام المكتملة' : 'Tasks Completed', value: totalDone, icon: glyph('tasks'), color: 'var(--mizan-cyan)', dim: 'rgba(201, 56, 3,0.1)' },
          { label: t('streak'), value: `${stats.streak || 0} ${isAr ? 'يوم' : 'days'}`, icon: glyph('streak'), color: 'var(--mizan-purple)', dim: 'rgba(251, 70, 4,0.1)' },
          { label: t('points'), value: stats.points || 0, icon: glyph('points'), color: 'var(--mizan-purple)', dim: 'rgba(251, 70, 4,0.1)' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
            style={{
              borderRadius: '16px',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className="glass-icon-mizan" style={{
                width: 38, height: 38,
                borderRadius: '14px',
                background: card.dim, // This dim color is already rgba, so it will blend with glass-icon-mizan's gradient
                border: `1px solid ${card.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
                color: card.color,
              }}>
                {card.icon}
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 600,
              color: card.color,
              lineHeight: 1,
              marginBottom: '0.25rem',
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {card.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weekly task bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '1.5rem',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'المهام الأسبوعية' : 'Weekly Tasks'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 140 }}>
          {weekData.map((day, i) => {
            const heightPct = maxDone > 0 ? (day.done / maxDone) * 100 : 0
            const isToday = day.key === getTodayKey()
            return (
              <div key={day.key} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.5rem', height: '100%',
              }}>
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {day.done}
                </div>
                <div style={{
                  flex: 1, width: '100%', display: 'flex',
                  alignItems: 'flex-end', justifyContent: 'center',
                }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 4)}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      width: '80%',
                      borderRadius: '3px 3px 0 0',
                      background: isToday ? 'var(--gold)' : 'var(--border-strong)',
                    }}
                  />
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: isToday ? 'var(--gold)' : 'var(--text-muted)',
                  fontWeight: isToday ? 500 : 400,
                }}>
                  {isAr ? day.labelAr : day.label}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Prayer heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '1.25rem',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'الصلوات الأسبوعية' : 'Prayer Tracker'}
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.8rem', minWidth: 400,
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '0.4rem 0.6rem',
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                  textAlign: isAr ? 'right' : 'left',
                  width: 80,
                }}>
                  {isAr ? 'الصلاة' : 'Prayer'}
                </th>
                {days.map(d => (
                  <th key={d.key} style={{
                    padding: '0.4rem 0.25rem',
                    color: d.key === getTodayKey() ? 'var(--gold)' : 'var(--text-muted)',
                    fontWeight: d.key === getTodayKey() ? 500 : 400,
                    textAlign: 'center',
                    minWidth: 40,
                  }}>
                    {isAr ? d.labelAr : d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prayers.map(prayer => (
                <tr key={prayer}>
                  <td style={{
                    padding: '0.5rem 0.6rem',
                    color: 'var(--text-secondary)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {prayerLabels[language][prayer]}
                  </td>
                  {days.map(d => {
                    const done = prayerData[d.key]?.[prayer]
                    return (
                      <td key={d.key} style={{ textAlign: 'center', padding: '0.5rem 0.25rem' }}>
                        <div style={{
                          width: 28, height: 28,
                          borderRadius: '8px',
                          background: done ? 'rgba(201, 56, 3,0.1)' : 'rgba(255,255,255,0.05)',
                          border: done ? '1px solid rgba(74,222,128,0.25)' : '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          margin: '0 auto',
                          color: done ? 'var(--emerald)' : 'var(--text-muted)',
                          fontSize: '0.7rem',
                        }}>
                          {done ? '✓' : '·'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Section breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '1.25rem',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'تفاصيل اليوم' : "Today's Breakdown"}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FIXED_SECTIONS.map(section => {
            const todayData = weekData.find(d => d.key === getTodayKey())
            return <SectionRow key={section.id} section={section} language={language} />
          })}
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 600px) {
          .analytics-padding { padding: 1rem !important; }
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function SectionRow({ section, language }) {
  const { tasks } = useApp()
  const isAr = language === 'ar'
  const sectionTasks = tasks[section.id] || []
  const done  = sectionTasks.filter(t => t.completed).length
  const total = sectionTasks.length
  const pct   = total > 0 ? (done / total) * 100 : 0
  const label = section.label[language]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ fontSize: '1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{section.icon}</span>
      <span style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        width: 120,
        flexShrink: 0,
        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 6, background: 'var(--bg-input)',
        borderRadius: 3, overflow: 'hidden',
      }}> {/* Progress bar background */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            height: '100%',
            borderRadius: 3,
            background: pct === 100 ? 'var(--mizan-cyan)' : pct > 50 ? 'var(--mizan-purple)' : 'var(--mizan-cyan)',
          }}
        />
      </div>
      <span style={{
        fontSize: '0.78rem', color: 'var(--text-muted)',
        width: 44, textAlign: 'right', flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {done}/{total}
      </span>
    </div>
  )
}
