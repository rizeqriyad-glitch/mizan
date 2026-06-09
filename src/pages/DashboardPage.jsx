import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { getGreeting, getFormattedDate, getDayOfWeek } from '../utils/dateUtils'
import PrayerTimesWidget from '../components/PrayerTimesWidget'
import FocusTimer from '../components/FocusTimer'
import StatsBar from '../components/StatsBar'
import QuranReader from '../components/QuranReader'
import AdhkarSection from '../components/AdhkarSection'

// ── Helpers ───────────────────────────────────────────────────────────────────
function localDateStr(d = new Date()) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-')
}
function fmt12h(str) {
  if (!str) return ''
  const [h, m] = str.split(':').map(Number)
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`
}
function fmtDur(mins) {
  if (!mins || mins <= 0) return ''
  const h = Math.floor(mins/60), m = mins%60
  return h>0&&m>0 ? `${h}h ${m}m` : h>0 ? `${h}h` : `${m}m`
}

// ── TodayProgram ──────────────────────────────────────────────────────────────
function TodayProgram() {
  const { user } = useAuth()
  const { language, prayerTimes, FIXED_SECTIONS: FS, scheduleBlocks, scheduleFrequency } = useApp()
  const isAr = language === 'ar'
  const today = localDateStr()

  const [dayProgram, setDayProgram] = useState(null)
  const [dayTasks,   setDayTasks]   = useState([])

  useEffect(() => {
    if (!user) return
    const unsub1 = onSnapshot(
      doc(db, 'users', user.uid, 'dayPrograms', today),
      snap => setDayProgram(snap.exists() ? snap.data() : null),
    )
    const unsub2 = onSnapshot(
      query(collection(db, 'users', user.uid, 'tasks'), where('date', '==', today)),
      snap => setDayTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    )
    return () => { unsub1(); unsub2() }
  }, [user, today])

  if (!dayProgram?.prayerSaved && !dayProgram?.customSaved) return null

  const tasksBySec = {}
  dayTasks.forEach(t => {
    const sid = t.sectionId || '__none__'
    if (!tasksBySec[sid]) tasksBySec[sid] = []
    tasksBySec[sid].push(t)
  })

  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  )
  const todayDay = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]
  const visibleBlocks = scheduleFrequency === 'weekly'
    ? scheduleBlocks.filter(b => !b.days || b.days.includes(todayDay))
    : scheduleBlocks

  const renderSection = (sections, accentColor, icon, title, usePrayerTimes) => {
    const populated = sections.filter(s => (tasksBySec[s.id] || []).length > 0)
    if (populated.length === 0) return null
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: `1px solid ${accentColor}28`, borderTop: `3px solid ${accentColor}`, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: `1px solid ${accentColor}14`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span>{icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: accentColor, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1 }}>{title}</span>
          <span style={{ fontSize: '0.63rem', color: 'var(--emerald)', background: 'var(--emerald-dim)', padding: '0.1rem 0.5rem', borderRadius: 99, fontWeight: 600 }}>✓ {isAr ? 'محفوظ' : 'Saved'}</span>
          <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)' }}>{dateLabel}</span>
        </div>
        {populated.map(section => {
          const tasks = tasksBySec[section.id] || []
          const name  = section.label?.[language] || section.label?.en || section.name || section.id
          const pt    = usePrayerTimes && prayerTimes?.[section.id] ? fmt12h(prayerTimes[section.id]) : null
          const done  = tasks.filter(t => t.completed).length
          return (
            <div key={section.id} style={{ padding: '0.6rem 1.25rem', borderBottom: `1px solid ${accentColor}0e` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem' }}>{section.icon || icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1 }}>{name}</span>
                {pt && <span style={{ fontSize: '0.58rem', color: accentColor, background: accentColor+'18', padding: '0.02rem 0.35rem', borderRadius: 99 }}>{pt}</span>}
                <span style={{ fontSize: '0.58rem', color: done === tasks.length ? 'var(--emerald)' : 'var(--text-muted)' }}>{done}/{tasks.length}</span>
              </div>
              {tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0 0.15rem 1.4rem' }}>
                  <span style={{ fontSize: '0.6rem', color: task.completed ? 'var(--emerald)' : 'var(--border-strong)', flexShrink: 0 }}>{task.completed ? '✓' : '○'}</span>
                  <span style={{ fontSize: '0.8rem', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.text}</span>
                  {task.reminderTime && <span style={{ fontSize: '0.56rem', color: 'var(--sapphire)', background: 'var(--sapphire-dim)', padding: '0.02rem 0.3rem', borderRadius: 99, flexShrink: 0 }}>🔔 {fmt12h(task.reminderTime)}</span>}
                  {task.duration > 0 && <span style={{ fontSize: '0.56rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.02rem 0.3rem', borderRadius: 99, flexShrink: 0 }}>⏱ {fmtDur(task.duration)}</span>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
        📋 {isAr ? 'برنامج اليوم المحفوظ' : "Today's Saved Program"}
      </div>
      {dayProgram?.prayerSaved && renderSection(FS, 'var(--gold)', '🕌', isAr ? 'الجدول الديني' : 'Prayer Timetable', true)}
      {dayProgram?.customSaved && renderSection(visibleBlocks, 'var(--sapphire)', '📅', isAr ? 'جدولي' : 'My Schedule', false)}
    </motion.div>
  )
}


// ── Saved Schedule constants ──────────────────────────────────────────────────
const PRAYER_COLS_DB = [
  { id: 'fajr',    icon: '🌙', en: 'Fajr',    ar: 'الفجر',   color: 'var(--sapphire)' },
  { id: 'shuruq',  icon: '🌄', en: 'Sunrise', ar: 'الشروق',  color: 'var(--gold)'     },
  { id: 'dhuhr',   icon: '☀️',  en: 'Dhuhr',   ar: 'الظهر',   color: 'var(--gold)'     },
  { id: 'asr',     icon: '🌤', en: 'Asr',     ar: 'العصر',   color: 'var(--emerald)'  },
  { id: 'maghrib', icon: '🌅', en: 'Maghrib',  ar: 'المغرب',  color: 'var(--ruby)'     },
  { id: 'isha',    icon: '🌃', en: 'Isha',    ar: 'العشاء',  color: 'var(--sapphire)' },
]
const FULL_DAYS_DB = [
  { key: 'sun', en: 'Sunday',    ar: 'الأحد'     },
  { key: 'mon', en: 'Monday',    ar: 'الاثنين'   },
  { key: 'tue', en: 'Tuesday',   ar: 'الثلاثاء'  },
  { key: 'wed', en: 'Wednesday', ar: 'الأربعاء'  },
  { key: 'thu', en: 'Thursday',  ar: 'الخميس'    },
  { key: 'fri', en: 'Friday',    ar: 'الجمعة'    },
  { key: 'sat', en: 'Saturday',  ar: 'السبت'     },
]
const COLOR_MAP_DB = { gold: 'var(--gold)', emerald: 'var(--emerald)', sapphire: 'var(--sapphire)', ruby: 'var(--ruby)' }

// ── SavedScheduleSection ──────────────────────────────────────────────────────
function SavedScheduleSection() {
  const { user } = useAuth()
  const { language } = useApp()
  const isAr = language === 'ar'
  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]
  const todayDate = localDateStr()

  const [prayerSaved,  setPrayerSaved]  = useState(false)
  const [customSaved,  setCustomSaved]  = useState(null)
  const [prayerItems,  setPrayerItems]  = useState([])
  const [customItems,  setCustomItems]  = useState([])
  const [activeTab,    setActiveTab]    = useState('prayer')

  const togglePrayerItem = async (item) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'prayerScheduleItems', item.id), { completed: !item.completed })
  }
  const toggleCustomItem = async (item) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'customScheduleItems', item.id), { completed: !item.completed })
  }

  useEffect(() => {
    if (!user) return
    const u1 = onSnapshot(doc(db, 'users', user.uid, 'savedSchedules', 'prayer'),
      snap => setPrayerSaved(snap.exists() ? !!snap.data()?.saved : false))
    const u2 = onSnapshot(doc(db, 'users', user.uid, 'savedSchedules', 'custom'),
      snap => setCustomSaved(snap.exists() && snap.data()?.saved ? snap.data() : null))
    const u3 = onSnapshot(collection(db, 'users', user.uid, 'prayerScheduleItems'),
      snap => setPrayerItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.order||0)-(b.order||0))))
    const u4 = onSnapshot(collection(db, 'users', user.uid, 'customScheduleItems'),
      snap => setCustomItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.order||0)-(b.order||0))))
    return () => { u1(); u2(); u3(); u4() }
  }, [user])

  const customTodayItems = customSaved?.type === 'weekly'
    ? customItems.filter(i => i.type === 'weekly' && (i.days || []).includes(todayKey))
    : customSaved?.type === 'daily'
    ? customItems.filter(i => i.type === 'daily' && i.date === (customSaved.date || todayDate))
    : []

  const hasPrayer = prayerSaved && prayerItems.length > 0
  const hasCustom = !!customSaved && (customSaved.type === 'weekly' ? customItems.filter(i => i.type === 'weekly').length > 0 : customTodayItems.length > 0)

  if (!hasPrayer && !hasCustom) return null

  const tabs = [
    hasPrayer && { id: 'prayer', icon: '🕌', label: isAr ? 'جدول الصلوات' : 'Prayer Schedule', color: 'var(--gold)' },
    hasCustom  && { id: 'custom', icon: '📅', label: isAr ? 'الجدول المخصص' : 'Custom Schedule', color: 'var(--sapphire)' },
  ].filter(Boolean)

  const tab = tabs.find(t => t.id === activeTab) ? activeTab : tabs[0]?.id
  const accent = tab === 'prayer' ? 'var(--gold)' : 'var(--sapphire)'
  const accentDim = tab === 'prayer' ? 'rgba(212,175,106,' : 'rgba(99,179,237,'

  // For weekly custom: all items grouped by day
  const weeklyItems = customItems.filter(i => i.type === 'weekly')

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      style={{ marginBottom: '1.5rem' }}
    >
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 3, height: 20, background: accent, borderRadius: 99, flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          📋 {isAr ? 'الجداول المحفوظة' : 'Saved Schedules'}
        </span>
        <div style={{ flex: 1, height: 1, background: accent + '25' }} />
      </div>

      {/* Card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: `1px solid ${accentDim}0.2)`, borderTop: `3px solid ${accent}`, overflow: 'hidden', boxShadow: `0 4px 20px ${accentDim}0.08)` }}>

        {/* Tab bar */}
        {tabs.length > 1 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.25rem' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: '0.875rem 1rem', border: 'none', borderBottom: `2px solid ${tab === t.id ? t.color : 'transparent'}`, background: 'transparent', color: tab === t.id ? t.color : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', transition: 'all 0.18s', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '-1px' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Single tab label when only one */}
        {tabs.length === 1 && (
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem', background: `linear-gradient(135deg, ${accentDim}0.06) 0%, transparent 100%)` }}>
            <span style={{ fontSize: '1.1rem' }}>{tabs[0].icon}</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: accent, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{tabs[0].label}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--emerald)', background: 'var(--emerald-dim)', padding: '0.1rem 0.55rem', borderRadius: 99, fontWeight: 700, marginInlineStart: 'auto' }}>✓ {isAr ? 'محفوظ' : 'Saved'}</span>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── Prayer schedule ── */}
          {tab === 'prayer' && (
            <motion.div key="prayer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.875rem' }} className="sched-prayer-grid">
                {PRAYER_COLS_DB.map(prayer => {
                  const colItems = prayerItems.filter(i => i.prayerId === prayer.id)
                  return (
                    <div key={prayer.id} style={{ background: prayer.color + '08', borderRadius: 14, border: `1px solid ${prayer.color}22`, borderTop: `2px solid ${prayer.color}`, overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 0.6rem', borderBottom: `1px solid ${prayer.color}15`, textAlign: 'center', background: `linear-gradient(180deg, ${prayer.color}10 0%, transparent 100%)` }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{prayer.icon}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: prayer.color, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? prayer.ar : prayer.en}</div>
                        {colItems.length > 0 && <div style={{ fontSize: '0.58rem', color: prayer.color, background: prayer.color + '18', borderRadius: 99, padding: '0.05rem 0.4rem', marginTop: '0.25rem', display: 'inline-block', fontWeight: 600 }}>{colItems.length}</div>}
                      </div>
                      <div style={{ padding: '0.5rem 0.55rem', minHeight: 60 }}>
                        {colItems.length === 0
                          ? <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textAlign: 'center', padding: '0.75rem 0', opacity: 0.45, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>—</div>
                          : colItems.map(item => {
                              const done = !!item.completed
                              const c = done ? 'var(--emerald)' : (COLOR_MAP_DB[item.color] || prayer.color)
                              return (
                                <div key={item.id} onClick={() => togglePrayerItem(item)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.4rem', background: done ? 'rgba(74,222,128,0.1)' : c + '0e', borderLeft: `2px solid ${c}`, borderRadius: 7, marginBottom: '0.3rem', cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none' }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: done ? 'var(--emerald)' : 'transparent', border: `1.5px solid ${done ? 'var(--emerald)' : c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                                    {done && <span style={{ fontSize: '0.55rem', color: 'white', fontWeight: 700 }}>✓</span>}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: done ? 'var(--emerald)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1 }}>{item.text}</div>
                                    {!done && (item.reminderTime || item.duration > 0) && (
                                      <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.08rem' }}>
                                        {item.reminderTime && <span style={{ fontSize: '0.57rem', color: 'var(--sapphire)' }}>🔔 {fmt12h(item.reminderTime)}</span>}
                                        {item.duration > 0 && <span style={{ fontSize: '0.57rem', color: 'var(--text-muted)' }}>⏱ {fmtDur(item.duration)}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Custom schedule ── */}
          {tab === 'custom' && customSaved?.type === 'weekly' && (
            <motion.div key="custom-weekly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '1.25rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.65rem' }} className="sched-week-grid">
                {FULL_DAYS_DB.map(day => {
                  const isToday = day.key === todayKey
                  const colItems = weeklyItems.filter(i => (i.days || []).includes(day.key))
                  return (
                    <div key={day.key} style={{ borderRadius: 12, border: isToday ? '1px solid rgba(99,179,237,0.35)' : '1px solid var(--border)', borderTop: isToday ? '2px solid var(--sapphire)' : '2px solid var(--border)', background: isToday ? 'rgba(99,179,237,0.05)' : 'var(--bg-card)', overflow: 'hidden' }}>
                      <div style={{ padding: '0.6rem 0.45rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: isToday ? 'var(--sapphire)' : 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', lineHeight: 1.2, wordBreak: 'break-word' }}>{isAr ? day.ar : day.en}</div>
                        {isToday && <div style={{ fontSize: '0.52rem', color: 'var(--sapphire)', background: 'rgba(99,179,237,0.15)', borderRadius: 99, padding: '0.02rem 0.3rem', marginTop: '0.15rem', display: 'inline-block', fontWeight: 600 }}>{isAr ? 'اليوم' : 'Today'}</div>}
                      </div>
                      <div style={{ padding: '0.4rem 0.4rem', minHeight: 50 }}>
                        {colItems.length === 0
                          ? <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textAlign: 'center', padding: '0.5rem 0', opacity: 0.35 }}>—</div>
                          : colItems.map(item => {
                              const done = !!item.completed
                              const c = done ? 'var(--emerald)' : (COLOR_MAP_DB[item.color] || 'var(--sapphire)')
                              return (
                                <div key={item.id} onClick={() => toggleCustomItem(item)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.3rem', background: done ? 'rgba(74,222,128,0.1)' : c + '0e', borderLeft: `2px solid ${c}`, borderRadius: 6, marginBottom: '0.22rem', cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none' }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                  <div style={{ width: 13, height: 13, borderRadius: 3, flexShrink: 0, background: done ? 'var(--emerald)' : 'transparent', border: `1.5px solid ${done ? 'var(--emerald)' : c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                                    {done && <span style={{ fontSize: '0.5rem', color: 'white', fontWeight: 700 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: '0.62rem', color: done ? 'var(--emerald)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1, flex: 1 }}>{item.text}</span>
                                </div>
                              )
                            })
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {tab === 'custom' && customSaved?.type === 'daily' && (
            <motion.div key="custom-daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ padding: '1.25rem' }}
            >
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  🗓 {customSaved.date && new Date(customSaved.date + 'T00:00:00').toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                {customTodayItems.map(item => {
                  const done = !!item.completed
                  const c = done ? 'var(--emerald)' : (COLOR_MAP_DB[item.color] || 'var(--sapphire)')
                  return (
                    <div key={item.id} onClick={() => toggleCustomItem(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.875rem', background: done ? 'rgba(74,222,128,0.08)' : c + '0d', border: `1px solid ${done ? 'rgba(74,222,128,0.3)' : c + '20'}`, borderLeft: `3px solid ${c}`, borderRadius: 10, marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, background: done ? 'var(--emerald)' : 'transparent', border: `2px solid ${done ? 'var(--emerald)' : c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
                        {done && <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: done ? 'var(--emerald)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1 }}>{item.text}</div>
                        {!done && (item.reminderTime || item.duration > 0) && (
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }}>
                            {item.reminderTime && <span style={{ fontSize: '0.62rem', color: 'var(--sapphire)' }}>🔔 {fmt12h(item.reminderTime)}</span>}
                            {item.duration > 0 && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>⏱ {fmtDur(item.duration)}</span>}
                          </div>
                        )}
                      </div>
                      {done && <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', background: 'var(--emerald-dim)', padding: '0.1rem 0.45rem', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 900px) { .sched-prayer-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 520px) { .sched-prayer-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 340px) { .sched-prayer-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 860px) { .sched-week-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 560px) { .sched-week-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { language, completedToday, t, loading } = useApp()
  const isAr = language === 'ar'

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

      {/* Today's Saved Program */}
      <TodayProgram />

      {/* Widgets row: prayer times + weekly schedule (next to it) */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}
        className="dashboard-widgets"
      >
        <PrayerTimesWidget />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FocusTimer />
        </div>
      </div>

      {/* Saved Schedules */}
      <SavedScheduleSection />

      {/* Completed today */}
      {completedToday.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            marginBottom: '1.5rem',
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
            {completedToday.slice(0, 10).map((item) => (
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

      {/* Morning & Evening Adhkar */}
      <AdhkarSection />

      {/* Read Quran */}
      <QuranReader />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .dashboard-widgets { grid-template-columns: 1fr !important; }
          .dashboard-padding { padding: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
