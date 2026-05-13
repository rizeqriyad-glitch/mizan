/**
 * iPhone alarm audio player.
 *
 * Browser autoplay policy blocks audio that plays without a direct user
 * gesture. The fix: call unlockAlarm() inside the button click handler
 * (user gesture) so the AudioContext gets unlocked and the file is
 * pre-decoded. When startRadarAlarm() fires later (no gesture), the
 * pre-decoded buffer plays without restriction.
 */

const ALARM_URL = 'https://mizantask.netlify.app/iphone_alarm.mp3'

let _ctx    = null   // shared AudioContext (unlocked once per session)
let _buffer = null   // decoded PCM buffer (loaded once)

export function unlockAlarm() {
  // Call this inside a button onClick so the browser allows audio later.
  ;(async () => {
    try {
      if (!_ctx || _ctx.state === 'closed') {
        _ctx = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (_ctx.state === 'suspended') await _ctx.resume()

      if (!_buffer) {
        const res = await fetch(ALARM_URL)
        const ab  = await res.arrayBuffer()
        _buffer   = await _ctx.decodeAudioData(ab)
      }
    } catch {}
  })()
}

export function startRadarAlarm(durationSeconds = 8) {
  // ── Preferred: pre-buffered AudioContext (no autoplay restriction) ──
  if (_ctx && _buffer && _ctx.state === 'running') {
    try {
      const source = _ctx.createBufferSource()
      source.buffer = _buffer
      source.loop   = true
      source.connect(_ctx.destination)
      source.start()

      const tid = setTimeout(() => { try { source.stop() } catch {} }, durationSeconds * 1000)
      return () => { clearTimeout(tid); try { source.stop() } catch {} }
    } catch {}
  }

  // ── Fallback: plain Audio element (may still be blocked) ────────────
  try {
    const audio = new Audio(ALARM_URL)
    audio.loop   = true
    audio.volume = 0.9
    audio.play().catch(() => {})

    const tid = setTimeout(() => { audio.pause(); audio.currentTime = 0 }, durationSeconds * 1000)
    return () => { clearTimeout(tid); audio.pause(); audio.currentTime = 0 }
  } catch {
    return () => {}
  }
}
