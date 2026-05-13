export const ALARM_URL = 'https://raw.githubusercontent.com/rizeqriyad-glitch/mizan/main/public/iphone_alarm.mp3'

/** Create a pre-loaded, looping alarm Audio element. */
export function createAlarm() {
  const audio = new Audio(ALARM_URL)
  audio.preload = 'auto'
  audio.loop    = true
  audio.volume  = 0.9
  return audio
}
