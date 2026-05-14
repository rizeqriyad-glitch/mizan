/**
 * Builds a WAV blob in memory — 7 ascending chirps, iPhone Radar style.
 * Uses HTML5 Audio (not AudioContext) so volume and playback are reliable.
 */

let _dataURI  = null   // cached once
let _audio    = null   // single Audio element
let _interval = null

// ─── WAV generator ───────────────────────────────────────────────────────────
function buildWAV() {
  const sr    = 22050          // sample rate
  const dur   = 1.6            // seconds per cycle (pips + silence)
  const n     = Math.floor(sr * dur)
  const pcm   = new Int16Array(n)
  const freqs = [880, 988, 1109, 1175, 1319, 1480, 1661] // A5→G#6
  const pip   = 0.10           // seconds per pip
  const gap   = 0.04           // gap between pips

  freqs.forEach((freq, i) => {
    const s0 = Math.floor(i * (pip + gap) * sr)
    const s1 = Math.min(s0 + Math.floor(pip * sr), n)
    let ph = 0
    for (let s = s0; s < s1; s++) {
      const t   = (s - s0) / sr
      const rel = t / pip
      // attack 5 ms, then linear decay
      const env = rel < 0.05 ? rel / 0.05 : 1 - (rel - 0.05) / 0.95
      // slight upward chirp within each pip
      const f   = freq * (0.96 + 0.08 * rel)
      ph += (2 * Math.PI * f) / sr
      pcm[s] = Math.round(env * 0.85 * 32767 * Math.sin(ph))
    }
  })

  // ── WAV header ──────────────────────────────────────────────────────────────
  const wav = new ArrayBuffer(44 + n * 2)
  const v   = new DataView(wav)
  const tag = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)) }

  tag(0,  'RIFF');  v.setUint32(4,  36 + n * 2, true)
  tag(8,  'WAVE');  tag(12, 'fmt ')
  v.setUint32(16, 16,       true)   // fmt chunk size
  v.setUint16(20, 1,        true)   // PCM
  v.setUint16(22, 1,        true)   // mono
  v.setUint32(24, sr,       true)   // sample rate
  v.setUint32(28, sr * 2,   true)   // byte rate
  v.setUint16(32, 2,        true)   // block align
  v.setUint16(34, 16,       true)   // bits per sample
  tag(36, 'data'); v.setUint32(40, n * 2, true)

  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, pcm[i], true)

  // ── base64 encode (chunked to stay fast) ────────────────────────────────────
  const bytes = new Uint8Array(wav)
  const CHUNK = 8192
  let bin = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return 'data:audio/wav;base64,' + btoa(bin)
}

function dataURI() {
  if (!_dataURI) _dataURI = buildWAV()
  return _dataURI
}

function audio() {
  if (!_audio) {
    _audio = new Audio(dataURI())
    _audio.volume = 1.0
  }
  return _audio
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Call inside the "Start timer" click handler.
 * The play→pause during a user gesture unlocks the Audio element so it can
 * be triggered later without a gesture.
 */
export function primeAlarm() {
  const a = audio()
  a.play()
    .then(() => { a.pause(); a.currentTime = 0 })
    .catch(() => {})
}

/** Start the repeating alarm. */
export function startAlarm() {
  stopAlarm()
  const a = audio()
  const ring = () => {
    a.currentTime = 0
    a.play().catch(err => console.error('[alarm play]', err))
  }
  ring()
  _interval = setInterval(ring, 1700)
}

/** Stop the alarm. */
export function stopAlarm() {
  clearInterval(_interval)
  _interval = null
  if (_audio) { _audio.pause(); _audio.currentTime = 0 }
}
