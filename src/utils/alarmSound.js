/**
 * Recreates the iPhone "Radar" alarm tone style using Web Audio API.
 * Each pulse is an ascending frequency chirp (720 → 1080 Hz) with
 * a two-oscillator chorus effect, repeating at ~3.7 pulses/sec.
 *
 * Returns a stop() function. Call it to immediately silence the alarm.
 */
export function startRadarAlarm(durationSeconds = 3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const CYCLE = 0.27   // seconds between pulse starts (~3.7 pulses/sec)
    const PULSE = 0.19   // seconds each pulse lasts
    const count = Math.ceil(durationSeconds / CYCLE) + 1

    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * CYCLE

      // Two slightly detuned oscillators give a rich, chorus-like quality
      ;[720, 724].forEach(f0 => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'

        // Ascending chirp: 720 → 1080 Hz (a perfect fifth up)
        osc.frequency.setValueAtTime(f0, t)
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + PULSE * 0.68)

        // Envelope: sharp attack → sustain → exponential decay
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.32, t + 0.010)
        gain.gain.setValueAtTime(0.32, t + PULSE * 0.52)
        gain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

        osc.start(t)
        osc.stop(t + PULSE + 0.01)
      })
    }

    return () => { try { ctx.close() } catch {} }
  } catch {
    return () => {}
  }
}
