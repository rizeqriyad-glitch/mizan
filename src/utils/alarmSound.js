/**
 * iPhone Radar-style alarm: 7 ascending chirps, then silence, repeating.
 * Uses Web Audio API — no file loading, no network dependency.
 */

let _ctx = null
let _interval = null

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return _ctx
}

function playBurst() {
  const c = getCtx()
  // 7 ascending pips: A5 → B5 → C#6 → D6 → E6 → F#6 → G#6
  const freqs = [880, 988, 1109, 1175, 1319, 1480, 1661]
  const pipDur = 0.07
  const pipGap = 0.04
  const now = c.currentTime

  freqs.forEach((freq, i) => {
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)

    osc.type = 'sine'
    const s = now + i * (pipDur + pipGap)
    // slight upward chirp within each pip, like iPhone's electronic feel
    osc.frequency.setValueAtTime(freq * 0.96, s)
    osc.frequency.linearRampToValueAtTime(freq * 1.04, s + pipDur)

    gain.gain.setValueAtTime(0, s)
    gain.gain.linearRampToValueAtTime(0.48, s + 0.004)   // fast attack
    gain.gain.setValueAtTime(0.48, s + pipDur * 0.45)
    gain.gain.exponentialRampToValueAtTime(0.001, s + pipDur) // quick decay

    osc.start(s)
    osc.stop(s + pipDur + 0.01)
  })
}

function doStart() {
  playBurst()
  _interval = setInterval(() => {
    const c = getCtx()
    if (c.state === 'suspended') {
      c.resume().then(playBurst).catch(() => {})
    } else {
      playBurst()
    }
  }, 1700)
}

/** Call during a user-gesture (e.g. Start button click) to activate AudioContext. */
export function primeAlarm() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume().catch(() => {})
}

/** Start the looping alarm. */
export function startAlarm() {
  stopAlarm()
  const c = getCtx()
  if (c.state === 'suspended') {
    c.resume().then(doStart).catch(() => {})
  } else {
    doStart()
  }
}

/** Stop the alarm immediately. */
export function stopAlarm() {
  clearInterval(_interval)
  _interval = null
}
