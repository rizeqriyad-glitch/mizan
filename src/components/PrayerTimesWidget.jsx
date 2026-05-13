import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { formatPrayerTime, getNextPrayer, getCurrentPrayer } from '../utils/prayerTimes'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getTodayKey } from '../utils/dateUtils'

const PRAYER_ENTRIES = [
  { id: 'fajr',    label: { en: 'Fajr',    ar: 'الفجر'  }, icon: '🌙', timeKey: 'fajr'    },
  { id: 'duha',    label: { en: 'Duha',    ar: 'الضحى'  }, icon: '🌄', isVoluntary: true  },
  { id: 'dhuhr',   label: { en: 'Dhuhr',   ar: 'الظهر'  }, icon: '☀️',  timeKey: 'dhuhr'   },
  { id: 'asr',     label: { en: 'Asr',     ar: 'العصر'  }, icon: '🌤',  timeKey: 'asr'     },
  { id: 'maghrib', label: { en: 'Maghrib', ar: 'المغرب' }, icon: '🌅',  timeKey: 'maghrib' },
  { id: 'isha',    label: { en: 'Isha',    ar: 'العشاء' }, icon: '🌌',  timeKey: 'isha'    },
]

export default function PrayerTimesWidget() {
  const { prayerTimes, timeFormat, language, togglePrayer, t } = useApp()
  const { user } = useAuth()
  const [donePrayers, setDonePrayers] = useState({})
  const [nextPrayer, setNextPrayer] = useState(null)
  const [currentPrayer, setCurrentPrayer] = useState(null)
  const [now, setNow] = useState(new Date())
  const isAr = language === 'ar'

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (prayerTimes) {
      setNextPrayer(getNextPrayer(prayerTimes))
      setCurrentPrayer(getCurrentPrayer(prayerTimes))
    }
  }, [prayerTimes, now])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'prayers', getTodayKey()))
      if (snap.exists()) setDonePrayers(snap.data())
    }
    load()
  }, [user])

  const handleToggle = async (prayerId) => {
    const currentlyDone = !!donePrayers[prayerId]
    setDonePrayers(prev => ({ ...prev, [prayerId]: !currentlyDone }))
    await togglePrayer(prayerId, currentlyDone)
  }

  if (!prayerTimes) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
      }}>
        <div className="animate-pulse">⏳ {t('loadingPrayers')}</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {t('prayerTimes')}
        </h3>

        {nextPrayer && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--gold)',
            background: 'var(--gold-dim)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(212,175,106,0.2)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr ? 'القادمة' : 'Next'}: {nextPrayer.minutesUntil}m
          </div>
        )}
      </div>

      {/* Prayer list */}
      <div style={{ padding: '0.5rem 0' }}>
        {PRAYER_ENTRIES.map((prayer, i) => {
          const timeStr   = prayer.timeKey ? prayerTimes[prayer.timeKey] : null
          const isNext    = !prayer.isVoluntary && nextPrayer?.name === prayer.id
          const isCurrent = !prayer.isVoluntary && currentPrayer?.name === prayer.id
          const isDone    = !!donePrayers[prayer.id]

          return (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, x: isAr ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1.25rem',
                background: isNext ? 'var(--prayer-active)' : 'transparent',
                borderLeft: (!isAr && isCurrent) ? '2px solid var(--gold)' : (!isAr ? '2px solid transparent' : 'none'),
                borderRight: (isAr && isCurrent) ? '2px solid var(--gold)' : (isAr ? '2px solid transparent' : 'none'),
                transition: 'background var(--transition)',
                opacity: prayer.isVoluntary ? 0.9 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{prayer.icon}</span>
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: isNext ? 600 : 400,
                    color: isNext ? 'var(--gold)' : 'var(--text-primary)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {prayer.label[language]}
                  </div>
                  {isCurrent && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--gold)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}>
                      {t('currentPrayer')}
                    </div>
                  )}
                  {prayer.isVoluntary && (
                    <div style={{
                      fontSize: '0.68rem',
                      color: 'var(--amber)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}>
                      {t('sunnah')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {timeStr ? (
                  <span style={{
                    fontSize: '0.85rem',
                    color: isNext ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: isNext ? 500 : 400,
                  }}>
                    {formatPrayerTime(timeStr, timeFormat)}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {isAr ? 'بعد الشروق' : 'After sunrise'}
                  </span>
                )}

                {/* Toggle button */}
                <button
                  onClick={() => handleToggle(prayer.id)}
                  title={isDone
                    ? (isAr ? 'إلغاء التأشير' : 'Unmark')
                    : (isAr ? 'تأشير كمنجز' : 'Mark as done')}
                  style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: isDone ? '1.5px solid var(--emerald)' : '1.5px solid var(--border-strong)',
                    background: isDone ? 'var(--emerald-dim)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: isDone ? 'var(--emerald)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (isDone) {
                      e.currentTarget.style.borderColor = 'var(--ruby)'
                      e.currentTarget.style.color = 'var(--ruby)'
                      e.currentTarget.style.background = 'var(--ruby-dim)'
                    } else {
                      e.currentTarget.style.borderColor = 'var(--emerald)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDone ? 'var(--emerald)' : 'var(--border-strong)'
                    e.currentTarget.style.color = isDone ? 'var(--emerald)' : 'var(--text-muted)'
                    e.currentTarget.style.background = isDone ? 'var(--emerald-dim)' : 'transparent'
                  }}
                >
                  {isDone ? '✓' : '○'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
