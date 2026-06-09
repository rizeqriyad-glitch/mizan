// Aladhan API — https://aladhan.com/prayer-times-api

// Maps IANA timezone → Aladhan method number.
// Covers the most common timezones. Returns null if unknown (triggers country lookup).
const TIMEZONE_METHOD = {
  // Arabian Peninsula
  'Asia/Riyadh': 4, 'Asia/Jeddah': 4, 'Asia/Aden': 4,
  'Asia/Dubai': 16,
  'Asia/Kuwait': 9,
  'Asia/Qatar': 10,
  'Asia/Bahrain': 8, 'Asia/Muscat': 8,
  // Levant / Middle East
  'Africa/Cairo': 5,
  'Asia/Damascus': 5,
  'Asia/Amman': 23,
  'Asia/Gaza': 3, 'Asia/Hebron': 3,
  'Asia/Baghdad': 3, 'Asia/Beirut': 3,
  'Asia/Tehran': 7,
  // North Africa
  'Africa/Casablanca': 21, 'Africa/El_Aaiun': 21,
  'Africa/Algiers': 19,
  'Africa/Tunis': 18,
  'Africa/Tripoli': 3, 'Africa/Khartoum': 3,
  // South Asia
  'Asia/Karachi': 1,
  'Asia/Kabul': 1,
  'Asia/Kolkata': 1, 'Asia/Calcutta': 1,
  'Asia/Dhaka': 1,
  // Southeast Asia
  'Asia/Kuala_Lumpur': 17, 'Asia/Kuching': 17,
  'Asia/Brunei': 17,
  'Asia/Jakarta': 20, 'Asia/Makassar': 20, 'Asia/Jayapura': 20,
  'Asia/Singapore': 11,
  // Turkey
  'Europe/Istanbul': 13,
  // Russia
  'Europe/Moscow': 14, 'Europe/Samara': 14, 'Europe/Kaliningrad': 14,
  'Asia/Yekaterinburg': 14, 'Asia/Novosibirsk': 14, 'Asia/Omsk': 14,
  'Asia/Krasnoyarsk': 14, 'Asia/Irkutsk': 14, 'Asia/Yakutsk': 14,
  'Asia/Vladivostok': 14, 'Asia/Magadan': 14,
  // Europe
  'Europe/Paris': 12,
  'Europe/Lisbon': 22, 'Atlantic/Azores': 22, 'Atlantic/Madeira': 22,
  'Europe/London': 3, 'Europe/Dublin': 3,
  'Europe/Berlin': 3, 'Europe/Amsterdam': 3, 'Europe/Brussels': 3,
  'Europe/Vienna': 3, 'Europe/Zurich': 3, 'Europe/Rome': 3,
  'Europe/Madrid': 3, 'Europe/Stockholm': 3, 'Europe/Oslo': 3,
  'Europe/Copenhagen': 3, 'Europe/Helsinki': 3, 'Europe/Warsaw': 3,
  'Europe/Prague': 3, 'Europe/Budapest': 3, 'Europe/Bucharest': 3,
  'Europe/Athens': 3, 'Europe/Sofia': 3, 'Europe/Riga': 3,
  'Europe/Tallinn': 3, 'Europe/Vilnius': 3,
  // North America
  'America/New_York': 2, 'America/Chicago': 2, 'America/Denver': 2,
  'America/Los_Angeles': 2, 'America/Phoenix': 2, 'America/Detroit': 2,
  'America/Toronto': 2, 'America/Vancouver': 2, 'America/Montreal': 2,
  'America/Edmonton': 2, 'America/Winnipeg': 2, 'America/Halifax': 2,
  'America/St_Johns': 2, 'America/Anchorage': 2, 'America/Honolulu': 2,
  // Central Asia
  'Asia/Tashkent': 3, 'Asia/Almaty': 3, 'Asia/Bishkek': 3,
  'Asia/Dushanbe': 3, 'Asia/Ashgabat': 3, 'Asia/Baku': 3,
  'Asia/Tbilisi': 3, 'Asia/Yerevan': 3,
  // Sub-Saharan Africa
  'Africa/Nairobi': 3, 'Africa/Addis_Ababa': 3, 'Africa/Dar_es_Salaam': 3,
  'Africa/Mogadishu': 3, 'Africa/Nouakchott': 3, 'Africa/Dakar': 3,
  'Africa/Bamako': 3, 'Africa/Niamey': 3, 'Africa/Abidjan': 3,
  'Africa/Lagos': 3, 'Africa/Accra': 3, 'Africa/Kampala': 3,
  // Oceania
  'Australia/Sydney': 3, 'Australia/Melbourne': 3, 'Australia/Brisbane': 3,
  'Australia/Perth': 3, 'Australia/Adelaide': 3,
}

// Maps ISO 3166-1 alpha-2 country code → Aladhan method (fallback when timezone is ambiguous)
const COUNTRY_METHOD = {
  SA: 4, YE: 4,
  AE: 16,
  KW: 9,
  QA: 10,
  BH: 8, OM: 8,
  EG: 5, SY: 5,
  JO: 23,
  PS: 3, LB: 3, IQ: 3,
  MA: 21,
  DZ: 19,
  TN: 18,
  LY: 3, SD: 3,
  PK: 1, AF: 1, IN: 1, BD: 1,
  MY: 17, BN: 17,
  ID: 20,
  SG: 11,
  TR: 13,
  IR: 7,
  RU: 14,
  FR: 12,
  PT: 22,
  US: 2, CA: 2,
  UZ: 3, KZ: 3, TJ: 3, KG: 3, TM: 3,
  AZ: 3, GE: 3, AM: 3,
}

// Returns the method number for the user's IANA timezone, or null if not mapped.
export function getMethodForTimezone(tz) {
  return TIMEZONE_METHOD[tz] ?? null
}

// Returns the method number for a 2-letter country code. Defaults to MWL (3) for unknown countries.
export function getMethodForCountry(cc) {
  if (!cc) return 3
  return COUNTRY_METHOD[cc.toUpperCase()] ?? 3
}

export async function fetchPrayerTimes(latitude, longitude, method = 3) {
  try {
    const date = new Date()
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    )
    if (!response.ok) throw new Error('API error')
    const data = await response.json()
    const timings = data.data.timings
    return {
      fajr:     timings.Fajr,
      sunrise:  timings.Sunrise,
      dhuhr:    timings.Dhuhr,
      asr:      timings.Asr,
      sunset:   timings.Sunset,
      maghrib:  timings.Maghrib,
      isha:     timings.Isha,
      midnight: timings.Midnight,
      date: data.data.date,
      meta: data.data.meta,
    }
  } catch (err) {
    console.error('Prayer times fetch failed:', err)
    return {
      fajr:     '05:00',
      sunrise:  '06:30',
      dhuhr:    '12:30',
      asr:      '15:45',
      sunset:   '18:15',
      maghrib:  '18:30',
      isha:     '20:00',
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
    { name: 'fajr',    time: prayerTimes.fajr    },
    { name: 'shuruq',  time: prayerTimes.sunrise  },
    { name: 'dhuhr',   time: prayerTimes.dhuhr    },
    { name: 'asr',     time: prayerTimes.asr      },
    { name: 'maghrib', time: prayerTimes.maghrib  },
    { name: 'isha',    time: prayerTimes.isha      },
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

  if (nowMinutes < fajrMin)
    return { name: 'isha', time: prayerTimes.isha }
  if (nowMinutes >= fajrMin && nowMinutes < sunriseMin)
    return { name: 'fajr', time: prayerTimes.fajr }
  if (nowMinutes >= sunriseMin && nowMinutes < dhuhrMin)
    return { name: 'shuruq', time: prayerTimes.sunrise }
  if (nowMinutes >= dhuhrMin   && nowMinutes < asrMin)     return { name: 'dhuhr',   time: prayerTimes.dhuhr }
  if (nowMinutes >= asrMin     && nowMinutes < maghribMin)  return { name: 'asr',     time: prayerTimes.asr }
  if (nowMinutes >= maghribMin && nowMinutes < ishaMin)     return { name: 'maghrib', time: prayerTimes.maghrib }

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
