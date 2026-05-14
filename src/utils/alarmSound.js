/**
 * Synthesized iPhone "Radar" alarm tone.
 *
 * Architecture:
 *  - Each pulse: two detuned sine oscillators (chorus) + a faint 2nd harmonic
 *  - Delay + feedback network creates the characteristic sonar "ping" reverb
 *  - ~3.8 pulses/sec, each an ascending chirp (800 → 1200 Hz, perfect fifth)
 *
 * Returns a stop() function — call it to immediately cut the sound.
 */
export function startRadarAlarm(durationSeconds = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // ── Master output ──────────────────────────────────────────────
    const master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)

    // ── Echo / reverb ──────────────────────────────────────────────
    // Delay line with gentle feedback gives the sonar "ping" quality
    const echo         = ctx.createDelay(1.0)
    const echoFeedback = ctx.createGain()
    const echoWet      = ctx.createGain()
    echo.delayTime.value    = 0.21   // 210 ms echo tail
    echoFeedback.gain.value = 0.18   // 18 % feedback (subtle reverb)
    echoWet.gain.value      = 0.20   // echo wetness in mix

    echo.connect(echoFeedback)
    echoFeedback.connect(echo)
    echo.connect(echoWet)
    echoWet.connect(master)

    // ── Pulse scheduling ───────────────────────────────────────────
    const CYCLE = 0.265  // seconds between pulse starts  (~3.77 Hz)
    const PULSE = 0.185  // pulse on-time in seconds
    const count = Math.ceil(durationSeconds / CYCLE) + 1

    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * CYCLE

      // Main chirp — two slightly detuned oscillators for chorus richness
      ;[800, 804].forEach(f0 => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(master)  // dry path
        gain.connect(echo)    // wet path → echo tail

        osc.type = 'sine'

        // Ascending chirp: 800 → 1200 Hz (perfect fifth × 1.5)
        osc.frequency.setValueAtTime(f0, t)
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + PULSE * 0.65)

        // Envelope: fast attack → sustain → exponential decay
        gain.gain.setValueAtTime(0,    t)
        gain.gain.linearRampToValueAtTime(0.28,  t + 0.008)
        gain.gain.setValueAtTime(0.28, t + PULSE * 0.44)
        gain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

        osc.start(t)
        osc.stop(t + PULSE + 0.01)
      })

      // Faint 2nd harmonic — adds brightness / "digital" character
      const harm     = ctx.createOscillator()
      const harmGain = ctx.createGain()
      harm.connect(harmGain)
      harmGain.connect(master)

      harm.type = 'sine'
      harm.frequency.setValueAtTime(1600, t)
      harm.frequency.exponentialRampToValueAtTime(2400, t + PULSE * 0.65)

      harmGain.gain.setValueAtTime(0,    t)
      harmGain.gain.linearRampToValueAtTime(0.055, t + 0.008)
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + PULSE * 0.55)

      harm.start(t)
      harm.stop(t + PULSE + 0.01)
    }

    return () => { try { ctx.close() } catch {} }
  } catch {
    return () => {}
  }
}
