import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { startRadarAlarm } from '../utils/alarmSound'

const ADHAN_URL = 'https://cdn.islamic.network/adhan/audio/adhan-makkah.mp3'

const PRAYER_LABELS = {
  fajr:    { en: 'Fajr',    ar: 'الفجر'  },
  shuruq:  { en: 'Sunrise', ar: 'الشروق' },
  dhuhr:   { en: 'Dhuhr',   ar: 'الظهر'  },
  asr:     { en: 'Asr',     ar: 'العصر'  },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha:    { en: 'Isha',    ar: 'العشاء' },
}

// Maps prayer id → key in prayerTimes object
const PRAYER_TIME_KEY = {
  fajr:    'fajr',
  shuruq:  'sunrise',
  dhuhr:   'dhuhr',
  asr:     'asr',
  maghrib: 'maghrib',
  isha:    'isha',
}

const ALL_TIMED = Object.keys(PRAYER_TIME_KEY)
const OBLIGATORY = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadPlayed() {
  try {
    const raw = JSON.parse(localStorage.getItem('mizan_adhan_played') || 'null')
    if (raw?.date === todayKey()) return new Set(raw.prayers || [])
  } catch {}
  return new Set()
}

function savePlayed(played) {
  try {
    localStorage.setItem('mizan_adhan_played', JSON.stringify({
      date: todayKey(), prayers: [...played],
    }))
  } catch {}
}

export default function AdhanNotifier() {
  const { prayerTimes, language, prayerNotifications } = useApp()
  const isAr = language === 'ar'
  const [toast, setToast]             = useState(null)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const playedRef  = useRef(loadPlayed())
  const audioRef   = useRef(null)
  // Keep a ref so setTimeout callbacks always read the latest flag value
  const notifRef   = useRef(prayerNotifications)
  useEffect(() => { notifRef.current = prayerNotifications }, [prayerNotifications])

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }

  const playAdhan = async () => {
    stopAudio()
    try {
      const audio = new Audio(ADHAN_URL)
      audio.volume = 0.85
      audioRef.current = audio
      audio.addEventListener('ended', () => { audioRef.current = null })
      await audio.play()
      setAudioBlocked(false)
    } catch (err) {
      if (err.name === 'NotAllowedError') setAudioBlocked(true)
      else console.warn('Adhan audio failed:', err)
    }
  }

  const fire = (id) => {
    if (!notifRef.current) return
    playedRef.current.add(id)
    savePlayed(playedRef.current)
    setAudioBlocked(false)
    setToast({ id, label: PRAYER_LABELS[id] })

    if (id === 'shuruq') {
      // Sunrise is a time marker, not a prayer — play a short tone instead of adhan
      startRadarAlarm(4)
    } else {
      playAdhan()
    }

    // Browser notification
    if (Notification.permission === 'granted') {
      const label = PRAYER_LABELS[id]
      try {
        const title = id === 'shuruq'
          ? (isAr ? '🌄 حان وقت الشروق' : '🌄 Sunrise')
          : (isAr ? `حان وقت صلاة ${label.ar}` : `${label.en} Prayer Time`)
        const body = id === 'shuruq'
          ? (isAr ? 'طلعت الشمس — وقت صلاة الضحى' : 'Sun has risen — time for Duha prayer')
          : (isAr ? 'حَيَّ عَلَى الصَّلَاةِ' : 'Come to prayer')
        new Notification(title, { body, icon: '/favicon.ico', silent: true })
      } catch {}
    }
  }

  // Schedule timeouts precisely at each prayer time
  useEffect(() => {
    if (!prayerTimes) return

    const timeouts = []
    const now = new Date()

    // Immediate check — fires if we're within the current prayer/shuruq minute and it hasn't played yet
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    for (const id of ALL_TIMED) {
      const key = PRAYER_TIME_KEY[id]
      if (prayerTimes[key]?.substring(0, 5) === hhmm && !playedRef.current.has(id)) {
        fire(id)
        break
      }
    }

    // Schedule a precise setTimeout for every remaining prayer + shuruq today
    for (const id of ALL_TIMED) {
      const key = PRAYER_TIME_KEY[id]
      const t = prayerTimes[key]?.substring(0, 5)
      if (!t) continue
      const [ph, pm] = t.split(':').map(Number)
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ph, pm, 0, 0)
      const delay  = target.getTime() - now.getTime()
      if (delay <= 0) continue

      const tid = setTimeout(() => {
        if (!playedRef.current.has(id)) fire(id)
      }, delay)
      timeouts.push(tid)
    }

    return () => timeouts.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimes])

  // Request notification permission once
  useEffect(() => {
    if (prayerNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [prayerNotifications])

  useEffect(() => () => stopAudio(), [])

  const dismiss = () => { stopAudio(); setToast(null); setAudioBlocked(false) }

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          style={{
            position: 'fixed', top: '1.25rem', left: '50%',
            transform: 'translateX(-50%)', zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid rgba(212,175,106,0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,106,0.1)',
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            minWidth: 300, maxWidth: '90vw',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--gold-dim)', border: '1px solid rgba(212,175,106,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
          }}>🕌</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-arabic)', fontSize: '1rem', color: 'var(--gold)', direction: 'rtl', marginBottom: '0.2rem' }}>
              {toast.id === 'shuruq' ? 'طَلَعَتِ الشَّمْسُ' : 'حَيَّ عَلَى الصَّلَاةِ'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {toast.id === 'shuruq'
                ? (isAr ? 'وقت الشروق — يمكنك صلاة الضحى' : 'Sunrise — Duha prayer time begins')
                : (isAr ? `حان وقت صلاة ${toast.label.ar}` : `It's time for ${toast.label.en} prayer`)}
            </div>
            {audioBlocked && (
              <button onClick={playAdhan} style={{
                marginTop: '0.45rem', padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)', border: '1px solid rgba(212,175,106,0.35)',
                background: 'var(--gold-dim)', color: 'var(--gold)',
                fontSize: '0.75rem', cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                ▶ {isAr ? 'تشغيل الأذان' : 'Play Adhan'}
              </button>
            )}
          </div>

          <button onClick={dismiss} style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border-strong)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1,
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ruby-dim)'; e.currentTarget.style.color = 'var(--ruby)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >×</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
