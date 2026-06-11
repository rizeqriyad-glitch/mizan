import { useEffect } from 'react'

export function useLookAt(ref, intensity = 1) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const handler = (e) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY

      const rotateX = (dy / rect.height) * 15 * intensity
      const rotateY = (dx / rect.width) * 15 * intensity

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      el.style.transition = 'transform 0.1s ease-out'
    }

    const reset = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }

    el.addEventListener('mousemove', handler)
    el.addEventListener('mouseleave', reset)

    return () => {
      el.removeEventListener('mousemove', handler)
      el.removeEventListener('mouseleave', reset)
    }
  }, [intensity])
}
