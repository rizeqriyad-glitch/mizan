/**
 * Generates a gentle 4-note ascending chime (C5 E5 G5 C6) using Web Audio API.
 * Returns an object compatible with the Audio element interface used in components.
 */
export function createAlarm() {
  let ctx = null
  let loopInterval = null
  let active = false

  function getCtx() {
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctx
  }

  function playChime(c) {
    // C5, E5, G5, C6 — pleasant ascending major arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]
    const noteDur = 0.32
    const gap = 0.07
    const now = c.currentTime

    notes.forEach((freq, i) => {
      const osc  = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      const s = now + i * (noteDur + gap)
      gain.gain.setValueAtTime(0, s)
      gain.gain.linearRampToValueAtTime(0.32, s + 0.016) // soft attack
      gain.gain.setValueAtTime(0.32, s + noteDur * 0.35)
      gain.gain.exponentialRampToValueAtTime(0.001, s + noteDur) // bell-like decay

      osc.start(s)
      osc.stop(s + noteDur + 0.05)
    })
  }

  function startLooping(c) {
    active = true
    playChime(c)
    loopInterval = setInterval(() => {
      if (!active) return
      if (c.state === 'suspended') {
        c.resume().then(() => playChime(c)).catch(() => {})
      } else {
        playChime(c)
      }
    }, 2600)
  }

  return {
    get currentTime() { return 0 },
    set currentTime(_) {},
    loop: true,
    volume: 0.9,

    play() {
      clearInterval(loopInterval)
      const c = getCtx()
      if (c.state === 'suspended') {
        return c.resume().then(() => startLooping(c))
      }
      startLooping(c)
      return Promise.resolve()
    },

    pause() {
      active = false
      clearInterval(loopInterval)
      loopInterval = null
    },
  }
}
