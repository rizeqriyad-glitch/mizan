import { useEffect } from 'react'

/**
 * useScrollReveal — adds `.revealed` to every `[data-reveal]` inside the scope
 * as it scrolls into view. Content is visible by default (globals.css defines
 * the [data-reveal] base + a reduced-motion exception), so this only enhances;
 * it never gates visibility. One IntersectionObserver, unobserved after reveal,
 * fully torn down on unmount.
 *
 * @param {React.RefObject<HTMLElement>} scopeRef  container to scan (optional;
 *        falls back to document).
 * @param {Array} deps  re-scan when these change (e.g. async content arriving).
 */
export function useScrollReveal(scopeRef = null, deps = []) {
  useEffect(() => {
    const root = scopeRef?.current || document
    const els = root.querySelectorAll('[data-reveal]:not(.revealed)')
    if (!els.length) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      els.forEach(el => el.classList.add('revealed'))
      return
    }

    const ob = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          ob.unobserve(e.target)
        }
      }),
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    // .armed cancels the CSS failsafe — only for elements actually being watched
    els.forEach(el => { el.classList.add('armed'); ob.observe(el) })
    return () => ob.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * useMagnetic — primary-CTA magnetic pull toward the cursor (transform only).
 * Pass a ref to the button. No-op on touch / reduced-motion. Cleans up listeners.
 *
 * @param {React.RefObject<HTMLElement>} ref
 * @param {number} strength  pull factor (default 0.25)
 */
export function useMagnetic(ref, strength = 0.25) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduce || coarse) return

    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) * strength
      const y = (e.clientY - r.top - r.height / 2) * strength
      el.style.transform = `translate(${x}px, ${y}px)`
      el.style.transition = 'transform .1s ease-out'
    }
    const leave = () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)'
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => {
      el.removeEventListener('mousemove', move)
      el.removeEventListener('mouseleave', leave)
    }
  }, [ref, strength])
}
