import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useApp, FIXED_SECTIONS } from '../contexts/AppContext'
import { getGreeting, getFormattedDate, getDayOfWeek } from '../utils/dateUtils'
import TaskSection from '../components/TaskSection'
import PrayerTimesWidget from '../components/PrayerTimesWidget'
import FocusTimer from '../components/FocusTimer'
import StatsBar from '../components/StatsBar'
import QuranReader from '../components/QuranReader'
import AdhkarSection from '../components/AdhkarSection'
import ScheduleManager from '../components/ScheduleManager'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function DashboardPage() {
  const { user } = useAuth()
  const { language, completedToday, t, loading, scheduleType, scheduleFrequency, scheduleBlocks } = useApp()
  const isAr = language === 'ar'

  const todayDay = DAY_KEYS[new Date().getDay()]
  // Always show both prayer sections and custom schedule blocks together
  const customToday = scheduleFrequency === 'weekly'
    ? scheduleBlocks.filter(b => !b.days || b.days.includes(todayDay))
    : scheduleBlocks
  const activeSections = [...FIXED_SECTIONS, ...customToday]

  const greeting = getGreeting(language)
  const firstName = user?.displayName?.split(' ')[0] || ''

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', color: 'var(--text-muted)',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 1200,
      direction: isAr ? 'rtl' : 'ltr',
    }}
    className="dashboard-padding"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>
            <h1 style={{
              fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: isAr ? '2rem' : '2.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '0.35rem',
            }}>
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {getDayOfWeek(language)} · {getFormattedDate(language)}
            </p>
          </div>

          {/* Completed today badge */}
          {completedToday.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--emerald-dim)',
                border: '1px solid rgba(74,222,128,0.2)',
                color: 'var(--emerald)',
                fontSize: '0.8rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              ✓ {completedToday.length} {isAr ? 'مكتملة اليوم' : 'completed today'}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <StatsBar />

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--gold-glow)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💬</span>
        <div>
          <p style={{
            fontFamily: 'var(--font-arabic)',
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
            direction: 'rtl',
            marginBottom: '0.2rem',
          }}>
            {t('motivationalQuote')}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('quoteSource')}</p>
        </div>
      </motion.div>

      {/* Main layout: tasks | sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '1.5rem',
        alignItems: 'start',
      }}
      className="dashboard-grid"
      >
        {/* Left: task sections */}
        <div>
          <ScheduleManager />

          {activeSections.length > 0 ? (
            activeSections.map(section => (
              <TaskSection key={section.id} section={section} isFixed={scheduleType === 'prayer'} />
            ))
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}>
              {scheduleType === 'custom'
                ? (isAr
                    ? 'لا توجد أقسام لهذا اليوم. اضغط على "الجدول الزمني" أعلاه لإضافة أقسام.'
                    : 'No blocks for today. Click "Schedule" above to add time blocks.')
                : (isAr ? 'لا توجد مهام.' : 'No tasks yet.')}
            </div>
          )}
        </div>

        {/* Right: prayer times + focus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1.5rem' }}>
          <PrayerTimesWidget />
          <FocusTimer />

          {/* Completed Today */}
          {completedToday.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {t('completedToday')}
              </div>
              <div style={{ padding: '0.5rem 0', maxHeight: 220, overflowY: 'auto' }}>
                {completedToday.slice(0, 10).map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.4rem 1.25rem',
                  }}>
                    <span style={{ color: 'var(--emerald)', fontSize: '0.7rem' }}>✓</span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Morning & Evening Adhkar */}
      <AdhkarSection />

      {/* Read Quran */}
      <QuranReader />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .dashboard-grid > div:last-child { position: static !important; }
        }
        @media (max-width: 768px) {
          .dashboard-padding { padding: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
