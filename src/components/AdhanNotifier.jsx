import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

const ADHAN_URL = 'https://cdn.islamic.network/adhan/audio/adhan-makkah.mp3'

const PRAYER_LABELS = {
  fajr:    { en: 'Fajr',    ar: 'الفجر'  },
  dhuhr:   { en: 'Dhuhr',   ar: 'الظهر'  },
  asr:     { en: 'Asr',     ar: 'العصر'  },
  maghrib: { en: 'Maghrib', ar: 'المغرب' },
  isha:    { en: 'Isha',    ar: 'العشاء' },
}

const OBLIGATORY = Object.keys(PRAYER_LABELS)

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
      date: todayKey(),
      prayers: [...played],
    }))
  } catch {}
}

export default function AdhanNotifier() {
  const { prayerTimes, language } = useApp()
  const isAr = language === 'ar'
  const [toast, setToast] = useState(null) // { id, label }
  const [audioBlocked, setAudioBlocked] = useState(false)
  const playedRef = useRef(loadPlayed())
  const audioRef = useRef(null)

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
      if (err.name === 'NotAllowedError') {
        setAudioBlocked(true)
      } else {
        console.warn('Adhan audio failed to load:', err)
      }
    }
  }

  useEffect(() => {
    if (!prayerTimes) return

    const check = () => {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      for (const id of OBLIGATORY) {
        const t = prayerTimes[id]
        if (!t) continue
        // Compare HH:MM only
        if (t.substring(0, 5) === timeStr && !playedRef.current.has(id)) {
          playedRef.current.add(id)
          savePlayed(playedRef.current)
          setAudioBlocked(false)
          setToast({ id, label: PRAYER_LABELS[id] })
          playAdhan()
          break
        }
      }
    }

    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  // Cleanup audio on unmount
  useEffect(() => () => stopAudio(), [])

  const dismiss = () => {
    stopAudio()
    setToast(null)
    setAudioBlocked(false)
  }

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
            position: 'fixed',
            top: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'var(--bg-card)',
            border: '1px solid rgba(212,175,106,0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,175,106,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            minWidth: 300,
            maxWidth: '90vw',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        >
          {/* Mosque icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--gold-dim)',
            border: '1px solid rgba(212,175,106,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0,
          }}>
            🕌
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-arabic)',
              fontSize: '1rem',
              color: 'var(--gold)',
              direction: 'rtl',
              marginBottom: '0.2rem',
            }}>
              حَيَّ عَلَى الصَّلَاةِ
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {isAr
                ? `حان وقت صلاة ${toast.label.ar}`
                : `It's time for ${toast.label.en} prayer`}
            </div>

            {/* Play button shown only if browser blocked autoplay */}
            {audioBlocked && (
              <button
                onClick={playAdhan}
                style={{
                  marginTop: '0.45rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(212,175,106,0.35)',
                  background: 'var(--gold-dim)',
                  color: 'var(--gold)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}
              >
                ▶ {isAr ? 'تشغيل الأذان' : 'Play Adhan'}
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '1px solid var(--border-strong)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '1rem', lineHeight: 1,
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ruby-dim)'; e.currentTarget.style.color = 'var(--ruby)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
