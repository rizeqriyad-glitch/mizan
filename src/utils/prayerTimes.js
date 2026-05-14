// Uses the free Aladhan API for accurate prayer times
// https://aladhan.com/prayer-times-api

export async function fetchPrayerTimes(latitude, longitude) {
  try {
    const date = new Date()
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    
    // method=4: Umm Al-Qura University, Makkah — standard for Saudi Arabia and widely used across the Arab world
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=4`
    )
    
    if (!response.ok) throw new Error('API error')
    
    const data = await response.json()
    const timings = data.data.timings
    
    return {
      fajr:    timings.Fajr,
      sunrise: timings.Sunrise,
      dhuhr:   timings.Dhuhr,
      asr:     timings.Asr,
      sunset:  timings.Sunset,
      maghrib: timings.Maghrib,
      isha:    timings.Isha,
      midnight: timings.Midnight,
      date: data.data.date,
      meta: data.data.meta,
    }
  } catch (err) {
    console.error('Prayer times fetch failed:', err)
    // Return fallback times
    return {
      fajr:    '05:00',
      sunrise: '06:30',
      dhuhr:   '12:30',
      asr:     '15:45',
      sunset:  '18:15',
      maghrib: '18:30',
      isha:    '20:00',
      midnight: '00:00',
      fallback: true,
    }
  }
}

export function getNextPrayer(prayerTimes) {
  if (!prayerTimes) return null
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const prayers = [
    { name: 'fajr',    time: prayerTimes.fajr },
    { name: 'dhuhr',   time: prayerTimes.dhuhr },
    { name: 'asr',     time: prayerTimes.asr },
    { name: 'maghrib', time: prayerTimes.maghrib },
    { name: 'isha',    time: prayerTimes.isha },
  ]

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes > nowMinutes) {
      const diff = prayerMinutes - nowMinutes
      return { ...prayer, minutesUntil: diff }
    }
  }
  // After isha, next is fajr tomorrow
  const [h, m] = prayerTimes.fajr.split(':').map(Number)
  const fajrMinutes = h * 60 + m
  const diff = (24 * 60 - nowMinutes) + fajrMinutes
  return { name: 'fajr', time: prayerTimes.fajr, minutesUntil: diff }
}

export function getCurrentPrayer(prayerTimes) {
  if (!prayerTimes) return null
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const toMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m }

  const fajrMin    = toMin(prayerTimes.fajr)
  const sunriseMin = toMin(prayerTimes.sunrise)
  const dhuhrMin   = toMin(prayerTimes.dhuhr)
  const asrMin     = toMin(prayerTimes.asr)
  const maghribMin = toMin(prayerTimes.maghrib)
  const ishaMin    = toMin(prayerTimes.isha)

  // Before Fajr (midnight → Fajr): Isha window carries over from previous day
  if (nowMinutes < fajrMin)
    return { name: 'isha', time: prayerTimes.isha }

  // Fajr window: Fajr → Sunrise (ends at Shuruq)
  if (nowMinutes >= fajrMin && nowMinutes < sunriseMin)
    return { name: 'fajr', time: prayerTimes.fajr }

  // Between Sunrise and Dhuhr: Fajr window closed, next prayer not yet
  if (nowMinutes >= sunriseMin && nowMinutes < dhuhrMin)
    return null

  if (nowMinutes >= dhuhrMin   && nowMinutes < asrMin)     return { name: 'dhuhr',   time: prayerTimes.dhuhr }
  if (nowMinutes >= asrMin     && nowMinutes < maghribMin)  return { name: 'asr',     time: prayerTimes.asr }
  if (nowMinutes >= maghribMin && nowMinutes < ishaMin)     return { name: 'maghrib', time: prayerTimes.maghrib }

  // After Isha until midnight: Isha window (extends until Fajr next day)
  return { name: 'isha', time: prayerTimes.isha }
}

export function formatPrayerTime(timeStr, format = '12h') {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  if (format === '24h') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}
