/**
 * iPhone "Radar" alarm tone approximation using Web Audio API.
 *
 * Characteristics matched:
 *  - 4 pulses per second (0.25 s cycle)
 *  - Each pulse: ascending sine sweep 500 Hz → 980 Hz
 *  - Two detuned oscillators (+3 Hz) for chorus depth
 *  - Subtle octave overtone at ×2 frequency for brightness
 *  - Sharp 8 ms attack, sustain to 55 % of pulse, exponential decay
 *
 * Returns a stop() function — call it to immediately cut the sound.
 */
export function startRadarAlarm(durationSeconds = 3) {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)()
    const CYCLE = 0.25   // 4 pulses / sec  — matches Radar tempo
    const PULSE = 0.175  // each pulse lasts 175 ms; 75 ms silence between

    const count = Math.ceil(durationSeconds / CYCLE) + 1

    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * CYCLE

      // ── Two detuned main oscillators (chorus) ──────────────────────
      ;[500, 503].forEach(f0 => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(f0, t)
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.96, t + PULSE * 0.65)

        gain.gain.setValueAtTime(0,    t)
        gain.gain.linearRampToValueAtTime(0.30, t + 0.008)
        gain.gain.setValueAtTime(0.30, t + PULSE * 0.55)
        gain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

        osc.start(t)
        osc.stop(t + PULSE + 0.005)
      })

      // ── Octave overtone (adds brightness / digital texture) ─────────
      const osc3  = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.connect(gain3)
      gain3.connect(ctx.destination)

      osc3.type = 'sine'
      osc3.frequency.setValueAtTime(1000, t)
      osc3.frequency.exponentialRampToValueAtTime(1960, t + PULSE * 0.65)

      gain3.gain.setValueAtTime(0,    t)
      gain3.gain.linearRampToValueAtTime(0.10, t + 0.008)
      gain3.gain.setValueAtTime(0.10, t + PULSE * 0.55)
      gain3.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

      osc3.start(t)
      osc3.stop(t + PULSE + 0.005)
    }

    return () => { try { ctx.close() } catch {} }
  } catch {
    return () => {}
  }
}
