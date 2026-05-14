/**
 * Plays the iPhone Radar alarm tone (public/iphone_alarm.mp3).
 * Loops continuously for up to durationSeconds, then auto-stops.
 * Returns a stop() function to silence it immediately.
 */
export function startRadarAlarm(durationSeconds = 3) {
  let audio = null
  let timeoutId = null

  const stop = () => {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio = null
    }
    clearTimeout(timeoutId)
    timeoutId = null
  }

  try {
    audio = new Audio('/iphone_alarm.mp3')
    audio.loop = true
    audio.volume = 0.9

    const promise = audio.play()
    if (promise !== undefined) {
      promise.catch(() => {
        // Autoplay blocked — components surface a manual trigger if needed
      })
    }

    timeoutId = setTimeout(stop, durationSeconds * 1000)
  } catch {
    // Audio not supported
  }

  return stop
}
