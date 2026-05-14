import { loadAlarmFile } from './alarmStorage'

// Module-level Blob URL for the custom alarm (set once IndexedDB loads)
let customAlarmUrl  = null
let customAlarmName = null

// Initialise from IndexedDB when the module is first imported
loadAlarmFile().then(stored => {
  if (stored?.buffer) {
    const blob = new Blob([stored.buffer], { type: 'audio/mpeg' })
    customAlarmUrl  = URL.createObjectURL(blob)
    customAlarmName = stored.name || 'custom.mp3'
  }
}).catch(() => {})

export function setCustomAlarm(url, name) {
  if (customAlarmUrl) URL.revokeObjectURL(customAlarmUrl)
  customAlarmUrl  = url
  customAlarmName = name
}

export function clearCustomAlarm() {
  if (customAlarmUrl) URL.revokeObjectURL(customAlarmUrl)
  customAlarmUrl  = null
  customAlarmName = null
}

export function getCustomAlarmName() {
  return customAlarmName
}

/**
 * Start the alarm.
 * - If the user has uploaded an MP3 it plays that (looping) for durationSeconds.
 * - Otherwise falls back to the synthesised Radar-style tone.
 * Returns a stop() function.
 */
export function startRadarAlarm(durationSeconds = 3) {
  if (customAlarmUrl) {
    try {
      const audio = new Audio(customAlarmUrl)
      audio.volume = 1.0
      audio.loop   = true
      audio.play().catch(() => {})

      const timeout = setTimeout(() => {
        audio.pause()
        audio.currentTime = 0
      }, durationSeconds * 1000)

      return () => {
        clearTimeout(timeout)
        audio.pause()
        audio.currentTime = 0
      }
    } catch {}
  }

  return synthRadar(durationSeconds)
}

/* ── Synthesised Radar fallback ─────────────────────────────────── */

function synthRadar(durationSeconds) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const master = ctx.createGain()
    master.gain.value = 1.0
    master.connect(ctx.destination)

    const echo         = ctx.createDelay(1.0)
    const echoFeedback = ctx.createGain()
    const echoWet      = ctx.createGain()
    echo.delayTime.value    = 0.21
    echoFeedback.gain.value = 0.18
    echoWet.gain.value      = 0.20
    echo.connect(echoFeedback)
    echoFeedback.connect(echo)
    echo.connect(echoWet)
    echoWet.connect(master)

    const CYCLE = 0.265
    const PULSE = 0.185
    const count = Math.ceil(durationSeconds / CYCLE) + 1

    for (let i = 0; i < count; i++) {
      const t = ctx.currentTime + i * CYCLE

      ;[800, 804].forEach(f0 => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(master)
        gain.connect(echo)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f0, t)
        osc.frequency.exponentialRampToValueAtTime(f0 * 1.5, t + PULSE * 0.65)
        gain.gain.setValueAtTime(0,    t)
        gain.gain.linearRampToValueAtTime(0.45,  t + 0.008)
        gain.gain.setValueAtTime(0.45, t + PULSE * 0.44)
        gain.gain.exponentialRampToValueAtTime(0.001, t + PULSE)
        osc.start(t)
        osc.stop(t + PULSE + 0.01)
      })

      const harm     = ctx.createOscillator()
      const harmGain = ctx.createGain()
      harm.connect(harmGain)
      harmGain.connect(master)
      harm.type = 'sine'
      harm.frequency.setValueAtTime(1600, t)
      harm.frequency.exponentialRampToValueAtTime(2400, t + PULSE * 0.65)
      harmGain.gain.setValueAtTime(0,     t)
      harmGain.gain.linearRampToValueAtTime(0.09, t + 0.008)
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + PULSE * 0.55)
      harm.start(t)
      harm.stop(t + PULSE + 0.01)
    }

    return () => { try { ctx.close() } catch {} }
  } catch {
    return () => {}
  }
}
