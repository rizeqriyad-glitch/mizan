/**
 * Once an Audio element has been .play()-ed during a user gesture,
 * future .play() calls on the SAME element are never blocked — even
 * minutes later with no gesture. That's the only reliable cross-browser
 * way to bypass autoplay policy for timer alarms.
 *
 * Call unlockAlarm() inside the Start-Task / Start-Focus click handler.
 * Call startRadarAlarm() when the timer expires.
 */

const ALARM_URL = 'https://mizantask.netlify.app/iphone_alarm.mp3'

let _audio = null  // single pre-activated Audio element

export function unlockAlarm() {
  try {
    if (!_audio) {
      _audio = new Audio(ALARM_URL)
      _audio.preload = 'auto'
      _audio.loop    = true
      _audio.volume  = 0.9
    }
    // Play + immediately pause during the user gesture.
    // This "activates" the element so later .play() calls are never blocked.
    const p = _audio.play()
    if (p) p.then(() => { _audio.pause(); _audio.currentTime = 0 }).catch(() => {})
  } catch {}
}

export function startRadarAlarm(durationSeconds = 8) {
  const audio = _audio || new Audio(ALARM_URL)
  audio.loop   = true
  audio.volume = 0.9

  try {
    audio.currentTime = 0
    audio.play().catch(() => {})
  } catch {}

  const tid = setTimeout(() => {
    audio.pause()
    audio.currentTime = 0
  }, durationSeconds * 1000)

  return () => {
    clearTimeout(tid)
    audio.pause()
    audio.currentTime = 0
  }
}
