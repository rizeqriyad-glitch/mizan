/**
 * iPhone "Radar" alarm tone recreation using FM synthesis.
 *
 * Each pulse: an FM-modulated oscillator (carrier 520→920 Hz) with a
 * 35 Hz vibrato modulator and a short echo delay — the combination
 * produces the warm, warbling, ascending "ping" of the Radar tone.
 * Pulses repeat at ~2/sec for the given duration.
 *
 * Returns a stop() function. Call it to immediately cut the alarm.
 */
export function startRadarAlarm(durationSeconds = 3) {
  try {
    const ctx   = new (window.AudioContext || window.webkitAudioContext)()
    const CYCLE = 0.50   // ~2 pulses/sec
    const PULSE = 0.42   // each pulse lasts this long
    const count = Math.ceil(durationSeconds / CYCLE) + 1

    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * CYCLE

      /* ── FM carrier ─────────────────────────────────────────── */
      const carrier  = ctx.createOscillator()
      const modOsc   = ctx.createOscillator()
      const modGain  = ctx.createGain()
      const envGain  = ctx.createGain()

      carrier.type = 'sine'
      // Ascending chirp: 520 → 920 Hz
      carrier.frequency.setValueAtTime(520, t)
      carrier.frequency.exponentialRampToValueAtTime(920, t + PULSE * 0.72)

      // Modulator creates the characteristic "warble"
      modOsc.type = 'sine'
      modOsc.frequency.value = 35   // 35 Hz vibrato rate
      modGain.gain.value     = 42   // ±42 Hz depth

      // Amplitude envelope: soft attack → sustain → decay
      envGain.gain.setValueAtTime(0,    t)
      envGain.gain.linearRampToValueAtTime(0.40, t + 0.045)
      envGain.gain.setValueAtTime(0.40, t + PULSE * 0.55)
      envGain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

      /* ── Echo delay (gives the "room" feel of Radar) ─────────── */
      const delay     = ctx.createDelay(1.0)
      const delayGain = ctx.createGain()
      delay.delayTime.value = 0.075
      delayGain.gain.value  = 0.20

      /* ── Second harmonic for warmth ──────────────────────────── */
      const harm     = ctx.createOscillator()
      const harmGain = ctx.createGain()
      harm.type = 'sine'
      harm.frequency.setValueAtTime(1040, t)
      harm.frequency.exponentialRampToValueAtTime(1840, t + PULSE * 0.72)
      harmGain.gain.setValueAtTime(0,    t)
      harmGain.gain.linearRampToValueAtTime(0.09, t + 0.045)
      harmGain.gain.setValueAtTime(0.09, t + PULSE * 0.55)
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)

      /* ── Routing ─────────────────────────────────────────────── */
      modOsc.connect(modGain)
      modGain.connect(carrier.frequency)  // FM: modulator → carrier pitch

      carrier.connect(envGain)
      envGain.connect(ctx.destination)    // dry signal
      envGain.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(ctx.destination)  // wet (echo)

      harm.connect(harmGain)
      harmGain.connect(ctx.destination)

      /* ── Start / stop ────────────────────────────────────────── */
      const end = t + PULSE + 0.01
      modOsc.start(t);  modOsc.stop(end)
      carrier.start(t); carrier.stop(end)
      harm.start(t);    harm.stop(end)
    }

    return () => { try { ctx.close() } catch {} }
  } catch {
    return () => {}
  }
}
