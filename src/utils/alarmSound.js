// iPhone alarm MP3 served from GitHub raw (bypasses Netlify SPA redirect)
const ALARM_URL = 'https://raw.githubusercontent.com/rizeqriyad-glitch/mizan/main/public/iphone_alarm.mp3'

let _audio = null

function getAudio() {
  if (!_audio) {
    _audio = new Audio(ALARM_URL)
    _audio.preload = 'auto'
    _audio.loop    = true
    _audio.volume  = 1.0
  }
  return _audio
}

/**
 * Call inside the "Start timer" click handler.
 * Playing + immediately pausing during a user gesture unlocks the Audio
 * element so it can play later without a gesture.
 */
export function primeAlarm() {
  const a = getAudio()
  a.play()
    .then(() => { a.pause(); a.currentTime = 0 })
    .catch(() => {})
}

/** Start the looping alarm. */
export function startAlarm() {
  const a = getAudio()
  a.currentTime = 0
  a.play().catch(err => console.error('[alarm]', err))
}

/** Stop the alarm. */
export function stopAlarm() {
  if (_audio) { _audio.pause(); _audio.currentTime = 0 }
}
