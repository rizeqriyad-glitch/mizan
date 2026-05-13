export const ALARM_URL = 'https://mizantask.netlify.app/iphone_alarm.mp3'

/** Create a pre-loaded, looping alarm Audio element. */
export function createAlarm() {
  const audio = new Audio(ALARM_URL)
  audio.preload = 'auto'
  audio.loop    = true
  audio.volume  = 0.9
  return audio
}
