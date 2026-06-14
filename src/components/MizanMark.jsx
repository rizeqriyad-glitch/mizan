import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * MizanMark — the Mizan brand mark, concept B «محراب التوازن».
 *
 * A balance scale living inside a mihrab arch: the negative space carries
 * the Islamic meaning, the scale carries the name. 48×48 grid, stroke-only,
 * currentColor — inherits text color and accents via CSS.
 *
 * Entrance choreography (client-specified, respects prefers-reduced-motion):
 *   Phase A 0–900ms   : stroke-draw, cubic-bezier(.16,1,.3,1)
 *   Phase B 1000ms    : pans swing — left dips 8°, right rises — damped
 *                       spring settle, then ±3° sway every 3s (alternate)
 *   Phase C 1400ms    : wordmark «ميزان» clip-wipe reveal (RTL-aware,
 *                       never letter-split — Arabic shaping stays intact)
 *
 * Click (when linkTo is set): press-pop scale .94→1 over 300ms, then
 * navigate — never delaying navigation beyond ~150ms.
 *
 * Props (back-compatible):
 *   size      px square (default 64)
 *   showText  render the ميزان lockup (default false)
 *   state     'idle' | 'loading'  (loading = the mark seeks equilibrium)
 *   animateIn play the full entrance (default true)
 *   linkTo    wrap in an <a> that navigates there with press-pop
 *   color     optional override; defaults to currentColor inheritance
 */
export default function MizanMark({
  size = 64,
  showText = false,
  state = 'idle',
  animateIn = true,
  linkTo,
  color,
  color2, // accepted for v1 compatibility; single-color marks ignore it
  className = '',
  ...rest
}) {
  const uid = useId().replace(/[:]/g, '')
  const root = `mzmk-${uid}`
  const navigate = useNavigate()
  const [popped, setPopped] = useState(false)

  const handleClick = (e) => {
    if (!linkTo) return
    e.preventDefault()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      navigate(linkTo)
      return
    }
    setPopped(true)
    setTimeout(() => navigate(linkTo), 150)
    setTimeout(() => setPopped(false), 320)
  }

  const body = (
    <>
      <svg
        className="brand__mark"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="ميزان"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible', flexShrink: 0 }}
      >
        {/* Static: pointed mihrab niche, stepped base, central post */}
        <g className="mz-static">
          <path pathLength="1" className="mz-arch" d="M9.5 41 V19 C9.5 12 16 8.5 24 6 C32 8.5 38.5 12 38.5 19 V41" />
          <path pathLength="1" className="mz-base mz-fill" d="M20 40.5 H28 L26.6 37 H21.4 Z" />
          <path pathLength="1" className="mz-post" d="M24 37 V18.9" strokeWidth="2.4" />
        </g>

        {/* Moving: beam pivots at centre; each pan counter-swings at its hanger
            so the bowls hang like pendulums. Centre ring = the balance point
            (concept «محراب التوازن»). Bowls fill toward equilibrium. */}
        <g className="mz-beam" style={{ transformOrigin: '24px 18.5px', transformBox: 'view-box' }}>
          <path pathLength="1" d="M17 18.5 H31" />
          <circle className="mz-ring" cx="24" cy="15.2" r="1.7" />
          <g className="mz-pan" style={{ transformOrigin: '17px 18.5px', transformBox: 'view-box' }}>
            <path pathLength="1" d="M17 18.5 L13.7 24 M17 18.5 L20.3 24" strokeWidth="1.7" />
            <path pathLength="1" className="mz-bowl mz-fill" d="M13.5 23.6 Q17 29.6 20.5 23.6 Z" />
          </g>
          <g className="mz-pan" style={{ transformOrigin: '31px 18.5px', transformBox: 'view-box' }}>
            <path pathLength="1" d="M31 18.5 L27.7 24 M31 18.5 L34.3 24" strokeWidth="1.7" />
            <path pathLength="1" className="mz-bowl mz-fill" d="M27.5 23.6 Q31 29.6 34.5 23.6 Z" />
          </g>
        </g>
      </svg>

      {showText && (
        <span
          className="brand__name"
          data-wipe={animateIn ? 'true' : undefined}
          style={{
            fontSize: size * 0.45,
            ...(animateIn ? { animationDelay: '1.4s' } : {}),
          }}
        >
          ميزان
        </span>
      )}

      <style>{`
        /* Option-B mark: bowls + base solid, niche quieter, balance ring open */
        .${root} .mz-fill { fill: currentColor; }
        .${root} .mz-arch { opacity: .42; }
        .${root} .mz-ring { fill: none; }
        /* Phase B — equilibrium life. With entrance: damped settle at 1s
           (left pan dips 8°, springs back), blending into the ±3° sway. */
        ${animateIn ? `
        .${root} .mz-beam {
          animation: mzSettle-${uid} 1.05s cubic-bezier(.34,1.56,.64,1) 1s both,
                     mzSway-${uid} 3s ease-in-out 2.05s infinite alternate;
        }
        .${root} .mz-pan {
          animation: mzSettlePan-${uid} 1.05s cubic-bezier(.34,1.56,.64,1) 1s both,
                     mzSwayPan-${uid} 3s ease-in-out 2.05s infinite alternate;
        }
        ` : `
        .${root} .mz-beam { animation: mzSway-${uid} 3s ease-in-out infinite alternate; }
        .${root} .mz-pan  { animation: mzSwayPan-${uid} 3s ease-in-out infinite alternate; }
        `}
        @keyframes mzSettle-${uid} {
          0%   { transform: rotate(0deg); }
          30%  { transform: rotate(-8deg); }
          55%  { transform: rotate(2.6deg); }
          75%  { transform: rotate(-1.2deg); }
          100% { transform: rotate(-3deg); }
        }
        @keyframes mzSettlePan-${uid} {
          0%   { transform: rotate(0deg); }
          30%  { transform: rotate(6deg); }
          55%  { transform: rotate(-2deg); }
          75%  { transform: rotate(0.9deg); }
          100% { transform: rotate(2.25deg); }
        }
        @keyframes mzSway-${uid}    { from { transform: rotate(-3deg); }    to { transform: rotate(3deg); } }
        @keyframes mzSwayPan-${uid} { from { transform: rotate(2.25deg); }  to { transform: rotate(-2.25deg); } }

        /* Loading — the mark IS the spinner: it keeps seeking equilibrium */
        .${root}[data-state="loading"] .mz-beam {
          animation: mzSeek-${uid} 1.6s ease-in-out infinite alternate;
        }
        .${root}[data-state="loading"] .mz-pan {
          animation: mzSeekPan-${uid} 1.6s ease-in-out infinite alternate;
        }
        @keyframes mzSeek-${uid}    { from { transform: rotate(-7deg); }   to { transform: rotate(7deg); } }
        @keyframes mzSeekPan-${uid} { from { transform: rotate(5.25deg); } to { transform: rotate(-5.25deg); } }

        /* Hover/focus — the scale settles perfectly level */
        .${root}:hover .mz-beam, .${root}:hover .mz-pan,
        .brand:hover .${root} .mz-beam, .brand:hover .${root} .mz-pan,
        .brand:focus-visible .${root} .mz-beam, .brand:focus-visible .${root} .mz-pan,
        a.${root}:focus-visible .mz-beam, a.${root}:focus-visible .mz-pan {
          animation: none;
          transform: rotate(0deg);
          transition: transform .35s cubic-bezier(.34,1.56,.64,1);
        }

        /* Press-pop (click → home) */
        .${root}.is-pop svg { animation: mzPop-${uid} .3s cubic-bezier(.34,1.56,.64,1); }
        @keyframes mzPop-${uid} { from { transform: scale(.94); } to { transform: scale(1); } }

        ${animateIn ? `
        /* Phase A — stroke-draw, 900ms envelope */
        .${root} svg path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: mzDraw-${uid} .55s cubic-bezier(.16,1,.3,1) forwards;
        }
        .${root} .mz-arch { animation-duration: .7s; animation-delay: 0ms; }
        .${root} .mz-base { animation-delay: 150ms; }
        .${root} .mz-post { animation-delay: 250ms; }
        .${root} .mz-beam > path { animation-delay: 330ms; }
        .${root} .mz-pan path:nth-of-type(1) { animation-delay: 420ms; }
        .${root} .mz-pan path:nth-of-type(2) { animation-delay: 500ms; }
        @keyframes mzDraw-${uid} { to { stroke-dashoffset: 0; } }
        ` : ''}

        @media (prefers-reduced-motion: reduce) {
          .${root} .mz-beam, .${root} .mz-pan {
            animation: none !important;
            transform: none !important;
          }
          .${root} svg path {
            animation: none !important;
            stroke-dasharray: none !important;
            stroke-dashoffset: 0 !important;
          }
          .${root}.is-pop svg { animation: none !important; }
        }
      `}</style>
    </>
  )

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6em',
    lineHeight: 1,
    color: color || 'inherit',
  }

  if (linkTo) {
    return (
      <a
        href={linkTo}
        onClick={handleClick}
        className={`brand ${root} ${popped ? 'is-pop' : ''} ${className}`}
        data-state={state}
        aria-label="ميزان — الصفحة الرئيسية"
        style={{ ...baseStyle, textDecoration: 'none' }}
        {...rest}
      >
        {body}
      </a>
    )
  }

  return (
    <span className={`${root} ${className}`} data-state={state} style={baseStyle} {...rest}>
      {body}
    </span>
  )
}
