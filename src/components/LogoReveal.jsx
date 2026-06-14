import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import MizanMark from './MizanMark'

/**
 * LogoReveal — Signature Mix animation (§8 pen-ultra).
 * Phase 1 (0–2200ms): MizanMark stroke-draw + pan-swing (built into MizanMark).
 * Phase 2 (2200ms+): SVG exits → "ميزان" kinetic word reveal + underline + subtitle.
 *
 * Respects prefers-reduced-motion: skips directly to text phase.
 * Arabic word integrity preserved — no letter-splitting.
 */
export default function LogoReveal({ size = 80, subtitle, className = '', style }) {
  const [phase, setPhase] = useState('draw')

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setPhase('text')
      return
    }
    const t = setTimeout(() => setPhase('text'), 2200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: size + 40,
        ...style,
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'draw' && (
          <motion.div
            key="draw"
            exit={{ opacity: 0, scale: 0.82, filter: 'blur(6px)' }}
            transition={{ duration: 0.38, ease: [0.7, 0, 0.84, 0] }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <MizanMark size={size} animateIn state="idle" />
          </motion.div>
        )}

        {phase === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {/* Wordmark — single Arabic word, no letter-splitting */}
            <motion.div
              aria-label="ميزان"
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: `clamp(${size * 0.6}px, ${size * 0.8}px, ${size}px)`,
                color: 'var(--text)',
                lineHeight: 1.2,
                perspective: '800px',
                transformOrigin: 'bottom center',
                direction: 'rtl',
              }}
              initial={{ opacity: 0, y: 36, rotateX: -55, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              ميزان
            </motion.div>

            {/* Underline sweeps from right (RTL start) */}
            <motion.div
              style={{
                height: '2px',
                width: '100%',
                background: 'var(--primary)',
                borderRadius: '1px',
                transformOrigin: 'right center',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.55, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />

            {/* Subtitle */}
            <motion.p
              style={{
                fontFamily: 'var(--font-brand)',
                fontSize: `clamp(${size * 0.16}px, ${size * 0.2}px, 1.1rem)`,
                color: 'var(--text-3)',
                textAlign: 'center',
                margin: 0,
                direction: 'rtl',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.72 }}
            >
              {subtitle ?? 'إنتاجية حول الصلوات الخمس'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
