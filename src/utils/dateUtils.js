export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function getGreeting(language = 'en') {
  const hour = new Date().getHours()
  if (language === 'ar') {
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء الخير'
    return 'مساء النور'
  }
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export function formatMinutesUntil(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getDayOfWeek(language = 'en') {
  const days = {
    en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    ar: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'],
  }
  return days[language]?.[new Date().getDay()] || days.en[new Date().getDay()]
}

export function getFormattedDate(language = 'en') {
  const d = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', options)
}

export function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
