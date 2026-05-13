/**
 * iPhone Radar-style alarm: 7 ascending chirps repeating every 1.7 s.
 * Uses Web Audio API — no file dependency.
 */

let _ctx      = null
let _interval = null

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return _ctx
}

function burst(c) {
  // 7 ascending pips: A5 → B5 → C#6 → D6 → E6 → F#6 → G#6
  const freqs = [880, 988, 1109, 1175, 1319, 1480, 1661]
  const dur = 0.07
  const gap = 0.04
  const t   = c.currentTime

  freqs.forEach((f, i) => {
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)

    osc.type = 'sine'
    const s = t + i * (dur + gap)
    // slight chirp within each pip
    osc.frequency.setValueAtTime(f * 0.96, s)
    osc.frequency.linearRampToValueAtTime(f * 1.04, s + dur)

    gain.gain.setValueAtTime(0, s)
    gain.gain.linearRampToValueAtTime(0.5, s + 0.004)
    gain.gain.setValueAtTime(0.5, s + dur * 0.45)
    gain.gain.exponentialRampToValueAtTime(0.001, s + dur)

    osc.start(s)
    osc.stop(s + dur + 0.01)
  })
}

function playOnContext(c) {
  if (c.state === 'closed') return
  if (c.state === 'suspended') {
    c.resume()
      .then(() => burst(c))
      .catch(err => console.error('[alarm] resume failed:', err))
  } else {
    burst(c)
  }
}

/**
 * Call this inside the "Start timer" button click handler.
 * Playing real audio (even nearly silent) during a user gesture is the
 * only reliable way to unlock Web Audio for later programmatic plays.
 */
export function primeAlarm() {
  const c = getCtx()
  const unlock = () => {
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    // Volume 0.001 — inaudible, but counts as real audio output
    gain.gain.setValueAtTime(0.001, c.currentTime)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.05)
  }
  if (c.state === 'suspended') {
    c.resume().then(unlock).catch(() => {})
  } else {
    unlock()
  }
}

/** Start the looping alarm sound. */
export function startAlarm() {
  stopAlarm()
  const c = getCtx()
  playOnContext(c)
  _interval = setInterval(() => playOnContext(c), 1700)
}

/** Stop the alarm immediately. */
export function stopAlarm() {
  clearInterval(_interval)
  _interval = null
}
