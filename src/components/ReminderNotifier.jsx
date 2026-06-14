import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { useAuth } from '../contexts/AuthContext'
import { startRadarAlarm } from '../utils/alarmSound'
import { getTodayKey } from '../utils/dateUtils'

const FIRED_KEY = 'mizan_reminders_fired'

function loadFired() {
  try {
    const raw = JSON.parse(localStorage.getItem(FIRED_KEY) || 'null')
    if (raw?.date === getTodayKey()) return new Set(raw.ids || [])
  } catch {}
  return new Set()
}

function saveFired(fired) {
  try {
    localStorage.setItem(FIRED_KEY, JSON.stringify({ date: getTodayKey(), ids: [...fired] }))
  } catch {}
}

function currentHHMM() {
  const n = new Date()
  return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
}

async function ensureNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission !== 'denied') {
    try { return (await Notification.requestPermission()) === 'granted' } catch {}
  }
  return false
}

export function requestReminderPermission() {
  return ensureNotifPermission()
}

function pushBrowserNotif(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try { new Notification(title, { body, icon: '/favicon.ico', silent: true }) } catch {}
}

export default function ReminderNotifier() {
  const { tasks, goals } = useApp()
  const { language } = useI18n()
  const { user } = useAuth()
  const isAr = language === 'ar'
  const [toasts, setToasts] = useState([])
  const [prayerItems, setPrayerItems] = useState([])
  const [customItems, setCustomItems] = useState([])
  const firedRef     = useRef(loadFired())
  const alarmStopRef = useRef(null)

  // Subscribe to schedule items for reminder checking
  useEffect(() => {
    if (!user) return
    const u1 = onSnapshot(
      collection(db, 'users', user.uid, 'prayerScheduleItems'),
      snap => setPrayerItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    const u2 = onSnapshot(
      collection(db, 'users', user.uid, 'customScheduleItems'),
      snap => setCustomItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    return () => { u1(); u2() }
  }, [user])

  const addToast = (id, icon, title, body) => {
    setToasts(prev => [...prev.filter(t => t.id !== id), { id, icon, title, body }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 9000)
  }

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const fireReminder = (uid, icon, title, body) => {
    if (firedRef.current.has(uid)) return
    firedRef.current.add(uid)
    saveFired(firedRef.current)

    if (alarmStopRef.current) { alarmStopRef.current(); alarmStopRef.current = null }
    alarmStopRef.current = startRadarAlarm(8)
    setTimeout(() => { alarmStopRef.current = null }, 8000)

    pushBrowserNotif(title, body)
    addToast(uid, icon, title, body)
  }

  useEffect(() => {
    ensureNotifPermission()

    const check = () => {
      const timeStr  = currentHHMM()
      const todayStr = getTodayKey()

      // ── Regular task reminders ────────────────────────────────────
      Object.values(tasks).flat().forEach(task => {
        if (task.completed || !task.reminderTime) return
        if (task.reminderTime.substring(0, 5) !== timeStr) return
        const uid   = `task-${task.id}-${timeStr}`
        const title = isAr ? '🔔 تذكير — ميزان' : '🔔 Task Reminder — Mizan'
        const body  = isAr ? `حان وقت: ${task.text}` : `Time to start: ${task.text}`
        fireReminder(uid, '🔔', title, body)
      })

      // ── Prayer schedule item reminders ────────────────────────────
      prayerItems.forEach(item => {
        if (item.completed || !item.reminderTime) return
        if (item.reminderTime.substring(0, 5) !== timeStr) return
        const uid   = `psched-${item.id}-${timeStr}`
        const title = isAr ? '🕌 تذكير الجدول الديني' : '🕌 Prayer Schedule Reminder'
        const body  = isAr ? `${item.icon || '📋'} ${item.text}` : `${item.icon || '📋'} ${item.text}`
        fireReminder(uid, item.icon || '🕌', title, body)
      })

      // ── Custom schedule item reminders ────────────────────────────
      customItems.forEach(item => {
        if (item.completed || !item.reminderTime) return
        if (item.reminderTime.substring(0, 5) !== timeStr) return
        // For daily items, only fire on the matching date
        if (item.type === 'daily' && item.date && item.date !== todayStr) return
        const uid   = `csched-${item.id}-${timeStr}`
        const title = isAr ? '📅 تذكير الجدول' : '📅 Schedule Reminder'
        const body  = isAr ? `${item.icon || '📋'} ${item.text}` : `${item.icon || '📋'} ${item.text}`
        fireReminder(uid, item.icon || '📅', title, body)
      })

      // ── Goal deadline day reminder (fires at 09:00) ───────────────
      if (timeStr === '09:00') {
        goals.forEach(goal => {
          if (!goal.deadline || goal.deadline !== todayStr) return
          const ms = goal.milestones || []
          if (ms.length > 0 && ms.every(m => m.completed)) return
          const name  = isAr && goal.titleAr ? goal.titleAr : goal.title
          const uid   = `goal-dl-${goal.id}-${todayStr}`
          const title = isAr ? '🎯 موعد الهدف اليوم!' : '🎯 Goal Deadline Today!'
          const body  = isAr ? `هدفك "${name}" يستحق الإنجاز اليوم` : `Your goal "${name}" is due today`
          fireReminder(uid, '🎯', title, body)
        })
      }
    }

    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, goals, prayerItems, customItems, isAr])

  useEffect(() => () => { if (alarmStopRef.current) alarmStopRef.current() }, [])

  return (
    <AnimatePresence>
      {toasts.map((toast, i) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          style={{
            position: 'fixed',
            top: `${1.25 + i * 6}rem`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9997,
            background: 'var(--bg-card)',
            border: '1px solid rgba(251, 70, 4,0.45)', // Mizan purple border
            borderRadius: '16px', // Mizan token for large cards
            padding: '1rem 1.25rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(251, 70, 4,0.1)', // Mizan purple shadow
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            minWidth: 300, maxWidth: '90vw',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        >
          {/* Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: toast.icon === '🎯' ? 'rgba(251, 70, 4,0.1)' : 'rgba(201, 56, 3,0.1)', // Mizan colors
            border: `1px solid ${toast.icon === '🎯' ? 'rgba(251, 70, 4,0.3)' : 'rgba(201, 56, 3,0.3)'}`, // Mizan colors
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0, // Mizan token for icons
          }}>
            {toast.icon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 600,
              color: toast.icon === '🎯' ? 'var(--mizan-purple)' : 'var(--mizan-cyan)', // Mizan colors
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              marginBottom: '0.2rem',
            }}>
              {toast.title}
            </div>
            <div style={{
              fontSize: '0.8rem', color: 'var(--text-secondary)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {toast.body}
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: '1rem', lineHeight: 1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition)', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ruby-dim)'; e.currentTarget.style.color = 'var(--ruby)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ×
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
