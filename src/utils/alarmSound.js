const ALARM_URL = 'https://mizantask.netlify.app/alarm.mp3'

/**
 * Plays the alarm audio file, looping until stopped or durationSeconds elapses.
 * Returns a stop() function — call it to immediately silence the alarm.
 */
export function startRadarAlarm(durationSeconds = 3) {
  try {
    const audio = new Audio(ALARM_URL)
    audio.loop = true
    audio.volume = 0.9

    audio.play().catch(() => {})

    const timeoutId = setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
    }, durationSeconds * 1000)

    return () => {
      clearTimeout(timeoutId)
      audio.pause()
      audio.currentTime = 0
    }
  } catch {
    return () => {}
  }
}
