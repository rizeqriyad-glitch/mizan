import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { formatPrayerTime, getNextPrayer, getCurrentPrayer } from '../utils/prayerTimes'

const PRAYER_ENTRIES = [
  { id: 'fajr',    label: { en: 'Fajr',    ar: 'الفجر'  }, icon: '🌙', timeKey: 'fajr'    },
  { id: 'shuruq',  label: { en: 'Sunrise', ar: 'الشروق' }, icon: '🌄', timeKey: 'sunrise', isMarker: true },
  { id: 'duha',    label: { en: 'Duha',    ar: 'الضحى'  }, icon: '🌞', isVoluntary: true, timeLabel: { en: 'After sunrise', ar: 'بعد الشروق' } },
  { id: 'dhuhr',   label: { en: 'Dhuhr',   ar: 'الظهر'  }, icon: '☀️',  timeKey: 'dhuhr'   },
  { id: 'asr',     label: { en: 'Asr',     ar: 'العصر'  }, icon: '🌤',  timeKey: 'asr'     },
  { id: 'maghrib', label: { en: 'Maghrib', ar: 'المغرب' }, icon: '🌅',  timeKey: 'maghrib' },
  { id: 'isha',    label: { en: 'Isha',    ar: 'العشاء' }, icon: '🌌',  timeKey: 'isha'    },
  { id: 'witr',    label: { en: 'Witr',    ar: 'الوتر'  }, icon: '🌜', isVoluntary: true, isMarker: true, timeLabel: { en: 'After Isha', ar: 'بعد العشاء' } },
]

export default function PrayerTimesWidget() {
  const { prayerTimes, timeFormat, language, togglePrayer, donePrayers, t } = useApp()
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

  const handleToggle = async (prayerId) => {
    const currentlyDone = !!donePrayers[prayerId]
    await togglePrayer(prayerId, currentlyDone)
  }

  if (!prayerTimes) {
    return (
      <div style={{
        // background: 'var(--bg-card)', // Handled by glass-card
        borderRadius: '16px', // Mizan token for large cards
        border: '1px solid var(--v-glass-border)', // Use glass border for loading state
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
        background: 'var(--v-glass-bg)', // Apply glass background to header
        borderBottom: '1px solid var(--v-glass-border)',
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
            color: 'var(--mizan-purple)',
            background: 'rgba(51, 156, 255,0.1)',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px', // Mizan token for full-pill
            border: '1px solid rgba(51, 156, 255,0.2)',
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
          const isNext    = !prayer.isVoluntary && !prayer.isMarker && nextPrayer?.name === prayer.id
          const isCurrent = currentPrayer?.name === prayer.id
          const isDone    = !!donePrayers[prayer.id]

          return (
            <motion.div
              key={prayer.id}
              initial={{ opacity: 0, x: isAr ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 1.25rem',
                background: isNext ? 'rgba(51, 156, 255,0.08)' : 'transparent',
                borderLeft: (!isAr && isCurrent) ? '2px solid var(--mizan-purple)' : (!isAr ? '2px solid transparent' : 'none'),
                borderRight: (isAr && isCurrent) ? '2px solid var(--mizan-purple)' : (isAr ? '2px solid transparent' : 'none'),
                transition: 'background var(--transition)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.05rem' }}>{prayer.icon}</span> {/* Icon is fine */}
                <div>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: isNext ? 700 : 400, // Mizan token for bold text
                    color: isNext ? 'var(--mizan-purple)' : 'var(--text-primary)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {prayer.label[language]}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--mizan-purple)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                      {prayer.isMarker
                        ? (isAr ? 'وقت الشروق الآن' : 'Sunrise now')
                        : t('currentPrayer')}
                    </div>
                  )}
                  {/* Prayer window end hint */}
                  {prayer.id === 'fajr' && prayerTimes?.sunrise && (
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                      {isAr ? `ينتهي عند الشروق ${formatPrayerTime(prayerTimes.sunrise, timeFormat)}` : `Ends at sunrise · ${formatPrayerTime(prayerTimes.sunrise, timeFormat)}`}
                    </div>
                  )}
                  {prayer.id === 'isha' && prayerTimes?.fajr && (
                    <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                      {isAr ? `يمتد حتى الفجر ${formatPrayerTime(prayerTimes.fajr, timeFormat)}` : `Extends until Fajr · ${formatPrayerTime(prayerTimes.fajr, timeFormat)}`}
                    </div>
                  )}
                  {prayer.isVoluntary && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--mizan-cyan)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                      {t('sunnah')}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {timeStr ? (
                  <span style={{
                    fontSize: '0.83rem',
                    color: isNext ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: isNext ? 500 : 400,
                  }}>
                    {formatPrayerTime(timeStr, timeFormat)}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {prayer.timeLabel?.[language]}
                  </span>
                )}

                {/* Toggle button — not shown for time markers like Sunrise */}
                {!prayer.isMarker && <button
                  onClick={() => handleToggle(prayer.id)}
                  title={isDone
                    ? (isAr ? 'إلغاء التأشير' : 'Unmark')
                    : (isAr ? 'تأشير كمنجز' : 'Mark as done')}
                  style={{
                    width: 30, height: 30,
                    borderRadius: '50%', // Mizan token for icons
                    border: isDone ? '1.5px solid var(--mizan-cyan)' : '1.5px solid var(--v-glass-border)',
                    background: isDone ? 'rgba(102, 181, 255,0.1)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: isDone ? 'var(--mizan-cyan)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    transition: 'all var(--transition)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    if (isDone) {
                      e.currentTarget.style.borderColor = 'var(--mizan-purple)'
                      e.currentTarget.style.color = 'var(--mizan-purple)'
                      e.currentTarget.style.background = 'rgba(51, 156, 255,0.1)'
                    } else {
                      e.currentTarget.style.borderColor = 'var(--mizan-cyan)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = isDone ? 'var(--mizan-cyan)' : 'var(--v-glass-border)'
                    e.currentTarget.style.color = isDone ? 'var(--mizan-cyan)' : 'var(--text-muted)'
                    e.currentTarget.style.background = isDone ? 'rgba(102, 181, 255,0.1)' : 'transparent'
                  }}
                >
                  {isDone ? '✓' : '○'}
                </button>}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
