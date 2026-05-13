import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { formatTimer } from '../utils/dateUtils'

const MODES = {
  work:  { label: { en: 'Focus',       ar: 'تركيز'         }, seconds: 25 * 60, color: 'var(--gold)' },
  break: { label: { en: 'Break',       ar: 'استراحة'       }, seconds: 5 * 60,  color: 'var(--emerald)' },
  long:  { label: { en: 'Long Break',  ar: 'استراحة طويلة' }, seconds: 15 * 60, color: 'var(--sapphire)' },
}

export default function FocusTimer() {
  const { language, t } = useApp()
  const isAr = language === 'ar'

  const [mode, setMode]       = useState('work')
  const [seconds, setSeconds] = useState(MODES.work.seconds)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const intervalRef = useRef(null)
  const startSecondsRef = useRef(MODES.work.seconds)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode === 'work') {
              setSessions(prev => prev + 1)
              setTotalFocusTime(prev => prev + MODES.work.seconds)
            }
            // Play a gentle notification
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)()
              const oscillator = ctx.createOscillator()
              const gainNode = ctx.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(ctx.destination)
              oscillator.frequency.value = 528
              gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
              oscillator.start(ctx.currentTime)
              oscillator.stop(ctx.currentTime + 1.5)
            } catch {}
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

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setSeconds(MODES[newMode].seconds)
    startSecondsRef.current = MODES[newMode].seconds
    setRunning(false)
  }

  const handleReset = () => {
    setRunning(false)
    setSeconds(MODES[mode].seconds)
  }

  const progress = 1 - (seconds / MODES[mode].seconds)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)
  const currentColor = MODES[mode].color

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
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
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {sessions} {isAr ? 'جلسة' : 'sessions'}
        </div>
      </div>

      {/* Mode selector */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        padding: '3px',
        marginBottom: '1.5rem',
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
              border: 'none',
              background: mode === key ? 'var(--bg-card)' : 'transparent',
              color: mode === key ? val.color : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: mode === key ? 500 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              boxShadow: mode === key ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {val.label[language]}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="4" />
            {/* Progress */}
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

          {/* Timer text */}
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
          onClick={() => setRunning(r => !r)}
          style={{
            flex: 1,
            padding: '0.7rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${currentColor}40`,
            background: running ? currentColor + '22' : currentColor + '15',
            color: currentColor,
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
        >
          {running ? t('stopFocus') : t('startFocus')}
        </motion.button>
        <button
          onClick={handleReset}
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'transparent',
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

      {/* Stats */}
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
