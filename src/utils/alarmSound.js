// iPhone Radar alarm MP3 — served from the repo's own public folder via GitHub raw CDN
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
 * Call this inside the button click handler that starts a timer.
 * Playing then immediately pausing during a user gesture unlocks the
 * Audio element so it can play later without triggering browser autoplay blocks.
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
  a.play().catch(err => console.warn('[alarm]', err))
}

/** Stop the alarm immediately. */
export function stopAlarm() {
  if (_audio) { _audio.pause(); _audio.currentTime = 0 }
}
