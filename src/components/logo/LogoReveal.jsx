import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

const PATHS = [
  { d: 'M22 60 L42 60',                  delay: 0,    dur: 0.32 },
  { d: 'M32 60 L32 18',                  delay: 0.22, dur: 0.5  },
  { d: 'M32 10 L36 14 L32 18 L28 14 Z', delay: 0.62, dur: 0.3  },
  { d: 'M8 22 Q32 16 56 22',            delay: 0.82, dur: 0.42 },
  { d: 'M8 22 L8 46',                   delay: 1.1,  dur: 0.28 },
  { d: 'M56 22 L56 46',                 delay: 1.1,  dur: 0.28 },
  { d: 'M2 46 Q8 56 14 46',            delay: 1.28, dur: 0.32 },
  { d: 'M50 46 Q56 56 62 46',          delay: 1.28, dur: 0.32 },
]

export default function LogoReveal({ scale = 1 }) {
  const reduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current

  const markSize = Math.round(40 * scale)
  const textSize = Math.round(26 * scale)
  const gap      = Math.round(10 * scale)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, perspective: '600px' }}>
      {/* Balance scale — Trim Paths draw 0–2s */}
      <svg
        width={markSize} height={markSize} viewBox="0 0 64 64"
        fill="none" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" style={{ flexShrink: 0 }}
      >
        {PATHS.map((p, i) =>
          reduced ? (
            <path key={i} d={p.d} stroke="var(--text-primary)" strokeWidth="2" />
          ) : (
            <motion.path
              key={i} d={p.d}
              stroke="var(--primary-600)" strokeWidth="2.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: p.dur, delay: p.delay, ease: 'easeInOut' },
                opacity:    { duration: 0.1,  delay: p.delay },
              }}
            />
          )
        )}
      </svg>

      {/* "ميزان" as one whole word — never split into characters */}
      <motion.span
        initial={reduced ? false : { opacity: 0, y: 24, rotateX: 60, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
        transition={reduced ? {} : { duration: 0.7, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: "'Palestine', sans-serif",
          fontSize: textSize,
          fontWeight: 400,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          transformOrigin: 'bottom center',
          display: 'inline-block',
        }}
        lang="ar"
      >
        ميزان
      </motion.span>
    </span>
  )
}
