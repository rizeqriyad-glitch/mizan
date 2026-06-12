import { useId } from 'react'

/**
 * MizanMark — the Mizan brand mark (concept B "Minaret Pillar",
 * AI-generated via Higgsfield, vectorized via Adobe, hand-cleaned here).
 *
 * A balance scale whose central pillar is a minaret-like girih column:
 * prayer and balance fused in one silhouette. 48×48 grid, single stroke
 * weight, currentColor — it inherits text color and accents via CSS.
 * Raster source of record: /public/brand/mizan-logo-vectorized.svg.
 *
 * Motion states (all respect prefers-reduced-motion):
 *   entrance : strokes draw on (pathLength dash)
 *   idle     : beam + pans sway ±1.8° — alive, ignorable
 *   hover    : (via .brand:hover or own hover) beam settles level, accent color
 *   loading  : continuous seek of equilibrium — the mark IS the spinner
 *
 * Props (back-compatible with v1):
 *   size      px square (default 64)
 *   showText  render the ميزان lockup (default false)
 *   state     'idle' | 'loading'
 *   animateIn play the draw-on entrance (default true)
 *   color     optional override; defaults to currentColor inheritance
 */
export default function MizanMark({
  size = 64,
  showText = false,
  state = 'idle',
  animateIn = true,
  color,
  color2, // accepted for v1 compatibility; single-color marks ignore it
  className = '',
  ...rest
}) {
  const uid = useId().replace(/[:]/g, '')
  const root = `mzmk-${uid}`

  return (
    <span
      className={`${root} ${className}`}
      data-state={state}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6em',
        lineHeight: 1,
        color: color || 'inherit',
      }}
      {...rest}
    >
      <svg
        className="brand__mark"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="ميزان"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        {/* Static: minaret column, finial star, base */}
        <g className="mz-post">
          {/* finial: diamond + node (girih star, simplified) */}
          <path pathLength="1" d="M24 4.5 L29.5 10 L24 15.5 L18.5 10 Z" />
          <circle pathLength="1" cx="24" cy="10" r="1.6" strokeWidth="2.4" />
          {/* column rails */}
          <path pathLength="1" d="M21.6 17.5 V37.5" strokeWidth="2.6" />
          <path pathLength="1" d="M26.4 17.5 V37.5" strokeWidth="2.6" />
          {/* lattice */}
          <path pathLength="1" d="M21.6 21 L26.4 26 M26.4 21 L21.6 26" strokeWidth="2.2" />
          <circle pathLength="1" cx="24" cy="30.5" r="2" strokeWidth="2.2" />
          <path pathLength="1" d="M21.6 34 L24 36.4 L26.4 34" strokeWidth="2.2" />
          {/* base */}
          <path pathLength="1" d="M16.5 37.5 L14 42.5 M31.5 37.5 L34 42.5" strokeWidth="2.6" />
          <path pathLength="1" d="M13 42.5 H35" />
        </g>

        {/* Moving: beam + the two teardrop pans (sways as one body) */}
        <g
          className="mz-beam"
          style={{ transformOrigin: '24px 15.5px', transformBox: 'view-box' }}
        >
          <path pathLength="1" d="M7 15.5 H41" />
          <path pathLength="1" className="mz-pan" d="M10 15.5 L3.5 24.5 A6.5 6.5 0 0 0 16.5 24.5 Z" />
          <path pathLength="1" className="mz-pan" d="M38 15.5 L31.5 24.5 A6.5 6.5 0 0 0 44.5 24.5 Z" />
        </g>
      </svg>

      {showText && (
        <span
          className="brand__name"
          data-wipe={animateIn ? 'true' : undefined}
          style={{ fontSize: size * 0.42 }}
        >
          ميزان
        </span>
      )}

      <style>{`
        .${root} .mz-beam {
          animation: mzSway-${uid} 7s ease-in-out infinite;
        }
        .${root}[data-state="loading"] .mz-beam {
          animation: mzSeek-${uid} 1.6s ease-in-out infinite;
        }
        .${root}:hover .mz-beam,
        .brand:hover .${root} .mz-beam,
        .brand:focus-visible .${root} .mz-beam {
          animation: none;
          transform: rotate(0deg);
          transition: transform .35s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes mzSway-${uid} {
          0%, 100% { transform: rotate(1.8deg); }
          50%      { transform: rotate(-1.8deg); }
        }
        @keyframes mzSeek-${uid} {
          0%, 100% { transform: rotate(7deg); }
          50%      { transform: rotate(-7deg); }
        }
        ${animateIn ? `
        .${root} svg path, .${root} svg circle {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: mzDraw-${uid} .7s cubic-bezier(.22,1,.36,1) forwards;
        }
        .${root} svg .mz-post path:nth-of-type(1) { animation-delay: 0ms; }
        .${root} svg .mz-post path:nth-of-type(2) { animation-delay: 60ms; }
        .${root} svg .mz-post path:nth-of-type(3) { animation-delay: 120ms; }
        .${root} svg .mz-post path:nth-of-type(4) { animation-delay: 160ms; }
        .${root} svg .mz-post path:nth-of-type(5) { animation-delay: 200ms; }
        .${root} svg .mz-post path:nth-of-type(6) { animation-delay: 240ms; }
        .${root} svg .mz-post path:nth-of-type(7) { animation-delay: 280ms; }
        .${root} svg circle { animation-delay: 100ms; }
        .${root} svg .mz-beam path:nth-of-type(1) { animation-delay: 320ms; }
        .${root} svg .mz-beam path:nth-of-type(2) { animation-delay: 400ms; }
        .${root} svg .mz-beam path:nth-of-type(3) { animation-delay: 460ms; }
        @keyframes mzDraw-${uid} { to { stroke-dashoffset: 0; } }
        ` : ''}
        @media (prefers-reduced-motion: reduce) {
          .${root} .mz-beam { animation: none !important; transform: none !important; }
          .${root} svg path, .${root} svg circle {
            animation: none !important;
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </span>
  )
}
