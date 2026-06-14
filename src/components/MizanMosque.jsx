/**
 * MizanMosque — hand-drawn mosque mark: crescent-topped onion dome, two slim
 * minarets with balcony rings, and an arched mihrab door. 24×24 line icon at
 * stroke 1.75, `currentColor` (tints with its context like the prayer glyphs).
 * lucide has no mosque, so this fills that gap. `size="1em"` scales to the
 * surrounding font-size; pass a number for a fixed px size.
 */
export default function MizanMosque({ size = '1em', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ verticalAlign: '-0.125em', flexShrink: 0 }} {...rest}
    >
      <path d="M2.5 21 H21.5" />
      <path d="M5 21 V8.4" />
      <path d="M4.25 8.4 Q4.25 6.9 5 6.7 Q5.75 6.9 5.75 8.4" />
      <path d="M5 6.7 V5.6" />
      <path d="M4.1 11.2 H5.9" />
      <path d="M19 21 V8.4" />
      <path d="M18.25 8.4 Q18.25 6.9 19 6.7 Q19.75 6.9 19.75 8.4" />
      <path d="M19 6.7 V5.6" />
      <path d="M18.1 11.2 H19.9" />
      <path d="M8 21 V13.5" />
      <path d="M16 21 V13.5" />
      <path d="M8 13.5 Q8 7.5 12 6.5 Q16 7.5 16 13.5" />
      <path d="M12 6.5 V5" />
      <path fill="currentColor" stroke="none" d="M12.35 2.1 A1.75 1.75 0 1 0 13.8 4.95 A1.32 1.32 0 1 1 12.35 2.1 Z" />
      <path d="M10.3 21 V16.5 Q10.3 14.3 12 14.3 Q13.7 14.3 13.7 16.5 V21" />
    </svg>
  )
}
