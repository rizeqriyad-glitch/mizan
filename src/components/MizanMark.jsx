import { useId } from 'react'

/**
 * MizanMark — interactive SVG logo for ميزان (M7 Letterform Mutation family).
 *
 * The mark is the literal meaning of the word: a balance scale. The signature
 * motion is the beam *settling into equilibrium* (a gentle sway at idle, a
 * decisive level on hover) — never a bounce, matching Mizan's calm-precise DNA.
 *
 * Ships all 4 motion states:
 *   - idle      : slow ±2° sway of the beam (alive, ignorable)
 *   - hover     : beam levels + pans lift, faster settle (<200ms)
 *   - entrance  : strokes draw on (stroke-dashoffset)
 *   - loading   : the mark IS the spinner (continuous beam tilt wave)
 *
 * Content is visible by default; animation only enhances. prefers-reduced-motion
 * freezes every state to the level, fully-drawn mark.
 *
 * Props:
 *   size      number  px of the square mark (default 64)
 *   showText  bool    render the Mizan / ميزان lockup (default false)
 *   state     string  'idle' | 'loading'  (default 'idle')
 *   animateIn bool    play the draw-on entrance (default true)
 *   color/color2      gradient stops (default Mizan purple → cyan)
 */
export default function MizanMark({
  size = 64,
  showText = false,
  state = 'idle',
  animateIn = true,
  color = '#6c47ff',
  color2 = '#00c9ff',
  className = '',
  ...rest
}) {
  const uid = useId().replace(/:/g, '')
  const gradId = `mizan-grad-${uid}`
  const rootClass = `mizan-mark-${uid}`

  return (
    <span
      className={`${rootClass} ${className}`}
      data-state={state}
      data-animate-in={animateIn ? 'true' : 'false'}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6em', lineHeight: 1 }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label="Mizan"
        fill="none"
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={gradId} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={color2} />
          </linearGradient>
        </defs>

        {/* Static stand: top hook, vertical post, base foot */}
        <g
          className="mizan-post"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="50" cy="16" r="4.5" />
          <path d="M50 20.5 V74" />
          <path d="M36 80 H64" />
          <path d="M50 74 L40 80 M50 74 L60 80" strokeWidth="4" />
        </g>

        {/* The balance beam + two hanging pans — this group is what moves */}
        <g
          className="mizan-beam"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transformOrigin: '50px 30px', transformBox: 'view-box' }}
        >
          {/* beam */}
          <path d="M22 30 H78" />
          {/* chains */}
          <path d="M24 30 V44" strokeWidth="3" />
          <path d="M76 30 V44" strokeWidth="3" />
          {/* left pan (purple-leaning) */}
          <path className="mizan-pan" d="M15 44 Q24 56 33 44" />
          {/* right pan (cyan-leaning) */}
          <path className="mizan-pan" d="M67 44 Q76 56 85 44" />
        </g>
      </svg>

      {showText && (
        <span className="mizan-lockup" style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: `${size * 0.34}px`,
            letterSpacing: '-0.01em',
            background: `linear-gradient(135deg, ${color}, ${color2})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.05,
          }}>Mizan</span>
          <span style={{
            fontFamily: 'var(--font-arabic)',
            fontWeight: 700,
            fontSize: `${size * 0.26}px`,
            color: 'var(--text-secondary)',
            lineHeight: 1.1,
          }}>ميزان</span>
        </span>
      )}

      <style>{`
        .${rootClass} svg { cursor: pointer; }

        /* idle — gentle sway, the scale never fully at rest */
        .${rootClass}[data-state="idle"] .mizan-beam {
          animation: mizanSway-${uid} 6s ease-in-out infinite;
        }
        @keyframes mizanSway-${uid} {
          0%, 100% { transform: rotate(-2.2deg); }
          50%      { transform: rotate(2.2deg); }
        }

        /* hover — settle to level, decisive and quick */
        .${rootClass} svg:hover .mizan-beam,
        .${rootClass}:hover .mizan-beam {
          animation: none;
          transform: rotate(0deg);
          transition: transform .35s cubic-bezier(.16,1,.3,1);
        }
        .${rootClass} svg:hover .mizan-pan {
          transition: transform .35s cubic-bezier(.34,1.56,.64,1);
        }

        /* loading — the mark is the spinner: continuous tilt wave */
        .${rootClass}[data-state="loading"] .mizan-beam {
          animation: mizanLoad-${uid} 1.2s ease-in-out infinite;
        }
        @keyframes mizanLoad-${uid} {
          0%   { transform: rotate(-9deg); }
          50%  { transform: rotate(9deg); }
          100% { transform: rotate(-9deg); }
        }

        /* entrance — strokes draw on, then beam settles to level */
        .${rootClass}[data-animate-in="true"] .mizan-post path,
        .${rootClass}[data-animate-in="true"] .mizan-post circle,
        .${rootClass}[data-animate-in="true"] .mizan-beam path {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: mizanDraw-${uid} .7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .${rootClass}[data-animate-in="true"] .mizan-beam path:nth-child(1) { animation-delay: .15s; }
        .${rootClass}[data-animate-in="true"] .mizan-pan { animation-delay: .35s; }
        @keyframes mizanDraw-${uid} { to { stroke-dashoffset: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .${rootClass} .mizan-beam,
          .${rootClass} .mizan-pan,
          .${rootClass} .mizan-post path,
          .${rootClass} .mizan-post circle {
            animation: none !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </span>
  )
}
