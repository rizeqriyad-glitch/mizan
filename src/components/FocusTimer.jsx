import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useI18n } from '../contexts/I18nContext'
import { glyph } from './glyphs'
import { formatTimer } from '../utils/dateUtils'
import { startRadarAlarm } from '../utils/alarmSound'

const MODES = {
  work:  { label: { en: 'Focus',       ar: 'تركيز'         }, color: 'var(--gold)' },
  break: { label: { en: 'Break',       ar: 'استراحة'       }, color: 'var(--emerald)' },
  long:  { label: { en: 'Long Break',  ar: 'استراحة طويلة' }, color: 'var(--sapphire)' },
}

const DEFAULT_MINUTES = { work: 25, break: 5, long: 15 }

function loadCustomMinutes() {
  try {
    const saved = JSON.parse(localStorage.getItem('mizan_focus_durations') || 'null')
    if (saved && saved.work && saved.break && saved.long) return saved
  } catch {}
  return { ...DEFAULT_MINUTES }
}

export default function FocusTimer() {
  const { language, t } = useI18n()
  const isAr = language === 'ar'

  const [customMins, setCustomMins] = useState(loadCustomMinutes)
  const [editing, setEditing] = useState(false)
  const [editValues, setEditValues] = useState({ ...loadCustomMinutes() })

  const [mode, setMode]       = useState('work')
  const [seconds, setSeconds] = useState(customMins.work * 60)
  const [running, setRunning] = useState(false)
  const [alarming, setAlarming] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const intervalRef    = useRef(null)
  const startSecsRef   = useRef(customMins.work * 60)
  const customMinsRef  = useRef(customMins)
  const alarmStopRef   = useRef(null)
  const alarmTimerRef  = useRef(null)

  // Keep ref in sync so interval callbacks see latest values
  useEffect(() => { customMinsRef.current = customMins }, [customMins])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode === 'work') {
              setSessions(prev => prev + 1)
              setTotalFocusTime(prev => prev + startSecsRef.current)
            }
            if (alarmStopRef.current) alarmStopRef.current()
            clearTimeout(alarmTimerRef.current)
            alarmStopRef.current = startRadarAlarm(8)
            setAlarming(true)
            alarmTimerRef.current = setTimeout(() => {
              alarmStopRef.current = null
              setAlarming(false)
            }, 8000)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  const stopAlarm = () => {
    if (alarmStopRef.current) { alarmStopRef.current(); alarmStopRef.current = null }
    clearTimeout(alarmTimerRef.current)
    alarmTimerRef.current = null
    setAlarming(false)
  }

  const handleModeChange = (newMode) => {
    stopAlarm()
    setMode(newMode)
    const secs = customMinsRef.current[newMode] * 60
    setSeconds(secs)
    startSecsRef.current = secs
    setRunning(false)
  }

  const handleReset = () => {
    stopAlarm()
    setRunning(false)
    setSeconds(customMinsRef.current[mode] * 60)
  }

  const openEdit = () => {
    setEditValues({ ...customMins })
    setEditing(true)
  }

  const saveEdit = () => {
    const newMins = {}
    Object.keys(MODES).forEach(k => {
      const v = parseInt(editValues[k], 10)
      newMins[k] = v > 0 && v <= 999 ? v : DEFAULT_MINUTES[k]
    })
    setCustomMins(newMins)
    customMinsRef.current = newMins
    try { localStorage.setItem('mizan_focus_durations', JSON.stringify(newMins)) } catch {}
    setEditing(false)
    setRunning(false)
    const newSecs = newMins[mode] * 60
    setSeconds(newSecs)
    startSecsRef.current = newSecs
  }

  const totalSecs = customMins[mode] * 60
  const progress = totalSecs > 0 ? 1 - (seconds / totalSecs) : 0
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)
  const currentColor = MODES[mode].color

  return (
    <div style={{
      // background: 'var(--bg-card)', // Handled by glass-card
      borderRadius: '16px', // Mizan token for large cards
      // border: '1px solid var(--border)', // Handled by glass-card
      padding: '1.5rem',
      direction: isAr ? 'rtl' : 'ltr',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {t('focusMode')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {sessions} {isAr ? 'جلسة' : 'sessions'}
          </span>
          <button
            onClick={openEdit}
            title={t('editDurations')}
            style={{
              width: 24, height: 24,
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = currentColor; e.currentTarget.style.color = currentColor }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ✎
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        padding: '3px',
        marginBottom: '1rem',
        gap: '3px',
      }}>
        {Object.entries(MODES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleModeChange(key)}
            style={{
              flex: 1,
              padding: '0.4rem',
              borderRadius: 'calc(var(--radius-md) - 2px)',
              border: 'none', // No border for toggle group items
              background: mode === key ? 'var(--mizan-purple)' : 'transparent', // Mizan purple for active
              color: mode === key ? 'white' : 'var(--text-muted)', // White text for active
              fontSize: '0.75rem',
              fontWeight: mode === key ? 500 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              boxShadow: mode === key ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {val.label[language]}
            <span style={{
              display: 'block',
              fontSize: '0.62rem',
              color: mode === key ? val.color : 'var(--text-muted)',
              opacity: 0.7,
              marginTop: '0.1rem',
            }}>
              {customMins[key]}{isAr ? 'د' : 'm'}
            </span>
          </button>
        ))}
      </div>

      {/* Edit durations panel */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: '1rem' }}
          >
            <div style={{
              padding: '0.875rem',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.625rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {isAr ? 'اضبط المدد (بالدقائق)' : 'Set durations (minutes)'}
              </div>
              {Object.entries(MODES).map(([key, val]) => (
                <div key={key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  marginBottom: '0.5rem',
                  direction: isAr ? 'rtl' : 'ltr',
                }}>
                  <span style={{
                    flex: 1,
                    fontSize: '0.8rem',
                    color: val.color,
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {val.label[language]}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={editValues[key]}
                    onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{
                      width: 64, // Slightly wider input
                      background: 'var(--bg-card)',
                      border: `1px solid ${val.color}40`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.3rem 0.4rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                    }}
                  />
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    width: 22,
                  }}>
                    {isAr ? 'د' : 'min'}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.625rem' }}>
                <button
                  onClick={saveEdit}
                  style={{
                    flex: 1,
                    padding: '0.4rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${currentColor}40`,
                    background: currentColor + '18',
                    color: currentColor,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer circle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={currentColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>

          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={Math.floor(seconds / 60)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 500,
                  color: running ? currentColor : 'var(--text-primary)',
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTimer(seconds)}
              </motion.span>
            </AnimatePresence>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {MODES[mode].label[language]}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={alarming ? stopAlarm : () => setRunning(r => !r)}
          style={{
            flex: 1,
            padding: '0.7rem',
            borderRadius: 'var(--radius-md)',
            border: alarming
              ? '1px solid rgba(74,222,128,0.5)'
              : `1px solid ${currentColor}40`,
            background: alarming
              ? 'rgba(74,222,128,0.15)'
              : running ? currentColor + '22' : currentColor + '15',
            color: alarming ? 'var(--emerald)' : currentColor,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
        >
          {alarming
            ? <>{glyph('bell', 14)} {isAr ? 'إيقاف التنبيه' : 'Stop Alarm'}</>
            : running ? t('stopFocus') : t('startFocus')}
        </motion.button>
        <button
          onClick={handleReset}
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'transparent', // Keep transparent for reset button
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ↺
        </button>
      </div>

      {totalFocusTime > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {Math.round(totalFocusTime / 60)} {t('minutesFocused')}
        </div>
      )}
    </div>
  )
}
