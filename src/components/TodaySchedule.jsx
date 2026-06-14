import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import TaskSection from './TaskSection'
import ScheduleManager from './ScheduleManager'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function TodaySchedule() {
  const {
    prayerTimes,
    FIXED_SECTIONS, scheduleBlocks, scheduleFrequency,
  } = useApp()
  const { language } = useI18n()
  const isAr = language === 'ar'
  const todayDay = DAY_KEYS[new Date().getDay()]

  const todayBlocks = scheduleFrequency === 'weekly'
    ? scheduleBlocks.filter(b => !b.days || b.days.includes(todayDay))
    : scheduleBlocks

  return (
    <div>
      {/* ── Prayer Timetable ── */}
      <GroupHeading
        color="var(--gold)"
        label={isAr ? 'الجدول الديني' : 'Prayer Timetable'}
        badge={prayerTimes?.fallback ? (isAr ? 'تقريبية' : 'approx') : null} // Keep badge
        badgeColor="var(--ruby)"
      />
      {FIXED_SECTIONS.map(section => (
        <TaskSection
          key={section.id}
          section={section}
          prayerTime={prayerTimes?.[section.id]}
        />
      ))}

      {/* ── Custom Schedule ── */}
      <div style={{ marginTop: '1.75rem' }}>
        <GroupHeading
          color="var(--sapphire)"
          label={isAr ? 'جدولي' : 'My Schedule'}
          sub={scheduleFrequency === 'weekly' ? (isAr ? 'أسبوعي' : 'Weekly') : (isAr ? 'يومي' : 'Daily')}
        />
        <ScheduleManager />
        {todayBlocks.map(block => (
          <TaskSection key={block.id} section={block} />
        ))}
        {scheduleBlocks.length > 0 && todayBlocks.length === 0 && (
          <div style={{
            padding: '1.25rem', textAlign: 'center',
            background: 'var(--v-glass-bg)', borderRadius: '16px', // Glass card
            border: '1px dashed var(--v-glass-border)', fontSize: '0.8rem', // Glass border
            color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr ? 'لا توجد أقسام مجدولة لهذا اليوم' : 'No blocks scheduled for today'}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupHeading({ color, label, sub, badge, badgeColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      marginBottom: '0.75rem', padding: '0 0.1rem',
    }}>
      <div style={{ width: 3, height: 18, background: color, borderRadius: 99, flexShrink: 0 }} />
      <span style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em',
        textTransform: 'uppercase', color,
      }}>
        {label}
      </span>
      {sub && (
        <span style={{
          fontSize: '0.62rem', color: 'var(--text-muted)', // Keep font size and color
          background: 'var(--v-glass-bg)', padding: '0.08rem 0.4rem', // Glass background
          borderRadius: 99,
        }}>
          {sub}
        </span>
      )}
      {badge && (
        <span style={{
          fontSize: '0.62rem', color: badgeColor,
          background: 'var(--ruby-dim)', padding: '0.08rem 0.4rem',
          borderRadius: 99,
        }}>
          {badge}
        </span>
      )}
    </div>
  )
}
