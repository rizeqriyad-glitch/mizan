// Uses the free Aladhan API for accurate prayer times
// https://aladhan.com/prayer-times-api

export async function fetchPrayerTimes(latitude, longitude) {
  try {
    const date = new Date()
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
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

  const prayers = [
    { name: 'fajr',    time: prayerTimes.fajr },
    { name: 'dhuhr',   time: prayerTimes.dhuhr },
    { name: 'asr',     time: prayerTimes.asr },
    { name: 'maghrib', time: prayerTimes.maghrib },
    { name: 'isha',    time: prayerTimes.isha },
  ]

  let current = null
  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes <= nowMinutes) {
      current = prayer
    }
  }
  return current
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
