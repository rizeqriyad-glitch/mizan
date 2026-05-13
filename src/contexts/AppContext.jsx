import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  addDoc, deleteDoc, serverTimestamp, query, where, orderBy, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { fetchPrayerTimes } from '../utils/prayerTimes'
import { getTodayKey } from '../utils/dateUtils'

const AppContext = createContext(null)

const OBLIGATORY_PRAYER_IDS = new Set(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])

// Fixed sections that cannot be deleted
export const FIXED_SECTIONS = [
  { id: 'fajr',    label: { en: 'Fajr',    ar: 'الفجر'  }, type: 'prayer', icon: '🌙' },
  { id: 'dhuhr',   label: { en: 'Dhuhr',   ar: 'الظهر'  }, type: 'prayer', icon: '☀️' },
  { id: 'asr',     label: { en: 'Asr',     ar: 'العصر'  }, type: 'prayer', icon: '🌤' },
  { id: 'maghrib', label: { en: 'Maghrib', ar: 'المغرب' }, type: 'prayer', icon: '🌅' },
  { id: 'isha',    label: { en: 'Isha',    ar: 'العشاء' }, type: 'prayer', icon: '🌌' },
]

export const AppProvider = ({ children }) => {
  const { user, userProfile, updateProfile } = useAuth()

  const [language, setLanguage]         = useState('en')
  const [theme, setTheme]               = useState('dark')
  const [timeFormat, setTimeFormat]     = useState('12h')
  const [prayerTimes, setPrayerTimes]   = useState(null)
  const [location, setLocation]         = useState(null)
  const [tasks, setTasks]               = useState({})         // keyed by sectionId
  const [customSections, setCustomSections] = useState([])
  const [completedToday, setCompletedToday] = useState([])
  const [stats, setStats]               = useState({ streak: 0, points: 0 })
  const [donePrayers, setDonePrayers]   = useState({})
  const [focusTimer, setFocusTimer]     = useState({ active: false, seconds: 1500, running: false })
  const [loading, setLoading]           = useState(true)

  // Only count the 5 obligatory prayers (Duha / Witr are sunnah, excluded from counter)
  const prayersDone = Object.entries(donePrayers)
    .filter(([id, val]) => OBLIGATORY_PRAYER_IDS.has(id) && val === true)
    .length

  // Sync settings from profile
  useEffect(() => {
    if (userProfile) {
      setLanguage(userProfile.language || 'en')
      setTheme(userProfile.theme || 'dark')
      setTimeFormat(userProfile.timeFormat || '12h')
    }
  }, [userProfile])

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Apply language/RTL to DOM
  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
  }, [language])

  // Fetch prayer times
  useEffect(() => {
    const getPrayerTimes = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            setLocation({ latitude, longitude })
            const times = await fetchPrayerTimes(latitude, longitude)
            setPrayerTimes(times)
          },
          async () => {
            // Fallback to IP-based location
            const times = await fetchPrayerTimes(21.3891, 39.8579) // Mecca fallback
            setPrayerTimes(times)
          }
        )
      }
    }
    getPrayerTimes()
  }, [])

  // Load tasks from Firestore
  useEffect(() => {
    if (!user) { setLoading(false); return }

    const todayKey = getTodayKey()
    const tasksRef = collection(db, 'users', user.uid, 'tasks')
    const q = query(tasksRef, where('date', '==', todayKey))

    const unsubTasks = onSnapshot(q, (snapshot) => {
      const grouped = {}
      FIXED_SECTIONS.forEach(s => { grouped[s.id] = [] })
      snapshot.docs.forEach(doc => {
        const task = { id: doc.id, ...doc.data() }
        if (!grouped[task.sectionId]) grouped[task.sectionId] = []
        grouped[task.sectionId].push(task)
      })
      Object.keys(grouped).forEach(k => {
        grouped[k].sort((a, b) => (a.order || 0) - (b.order || 0))
      })
      setTasks(grouped)
      setLoading(false)
    })

    // Load completed tasks for today
    const completedRef = collection(db, 'users', user.uid, 'completed')
    const qc = query(completedRef, where('date', '==', todayKey))
    const unsubCompleted = onSnapshot(qc, (snapshot) => {
      setCompletedToday(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    // Load stats
    const statsRef = doc(db, 'users', user.uid, 'stats', 'current')
    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) setStats(snap.data())
    })

    // Load custom sections
    const sectionsRef = collection(db, 'users', user.uid, 'sections')
    const unsubSections = onSnapshot(sectionsRef, (snap) => {
      setCustomSections(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    // Subscribe to today's prayer completion doc (resets each new day)
    const prayersRef = doc(db, 'users', user.uid, 'prayers', todayKey)
    const unsubPrayers = onSnapshot(prayersRef, (snap) => {
      setDonePrayers(snap.exists() ? snap.data() : {})
    })

    return () => {
      unsubTasks()
      unsubCompleted()
      unsubStats()
      unsubSections()
      unsubPrayers()
    }
  }, [user])

  const changeLanguage = async (lang) => {
    setLanguage(lang)
    await updateProfile({ language: lang })
  }

  const changeTheme = async (t) => {
    setTheme(t)
    await updateProfile({ theme: t })
  }

  const changeTimeFormat = async (fmt) => {
    setTimeFormat(fmt)
    await updateProfile({ timeFormat: fmt })
  }

  const addTask = async (sectionId, text) => {
    if (!user || !text.trim()) return
    const sectionTasks = tasks[sectionId] || []
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      sectionId,
      text: text.trim(),
      completed: false,
      date: getTodayKey(),
      order: sectionTasks.length,
      createdAt: serverTimestamp(),
    })
  }

  const editTask = async (taskId, text) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { text })
  }

  const deleteTask = async (taskId) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId))
  }

  const toggleTask = async (task) => {
    if (!user) return
    const newCompleted = !task.completed
    await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), {
      completed: newCompleted,
      completedAt: newCompleted ? serverTimestamp() : null,
    })

    if (newCompleted) {
      await addDoc(collection(db, 'users', user.uid, 'completed'), {
        taskId: task.id,
        text: task.text,
        sectionId: task.sectionId,
        date: getTodayKey(),
        completedAt: serverTimestamp(),
      })
      // Update stats
      const newPoints = (stats.points || 0) + 10
      await setDoc(
        doc(db, 'users', user.uid, 'stats', 'current'),
        { points: newPoints },
        { merge: true }
      )
    }
  }

  const togglePrayer = async (prayerId, currentlyDone) => {
    if (!user) return
    const todayKey = getTodayKey()
    // Optimistic update for instant UI feedback
    setDonePrayers(prev => ({ ...prev, [prayerId]: !currentlyDone }))
    await setDoc(
      doc(db, 'users', user.uid, 'prayers', todayKey),
      { [prayerId]: !currentlyDone, date: todayKey },
      { merge: true }
    )
  }

  const reorderTasks = async (sectionId, newOrder) => {
    if (!user) return
    const updates = newOrder.map((task, index) =>
      updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { order: index })
    )
    await Promise.all(updates)
  }

  const t = (key) => translations[language]?.[key] || translations['en'][key] || key

  return (
    <AppContext.Provider value={{
      language, changeLanguage,
      theme, changeTheme,
      timeFormat, changeTimeFormat,
      prayerTimes, location,
      tasks, customSections,
      completedToday, stats,
      donePrayers, prayersDone,
      addTask, editTask, deleteTask, toggleTask, togglePrayer, reorderTasks,
      focusTimer, setFocusTimer,
      loading, t,
      FIXED_SECTIONS,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

// ============================================================
// Translations
// ============================================================
const translations = {
  en: {
    appName: 'Mizan',
    tagline: 'Balance in All Things',
    signInWithGoogle: 'Continue with Google',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    today: 'Today',
    analytics: 'Analytics',
    settings: 'Settings',
    about: 'About',
    focusMode: 'Focus Mode',
    addTask: 'Add task...',
    completed: 'Completed',
    pending: 'Pending',
    completedToday: 'Completed Today',
    productivity: 'Productivity',
    streak: 'Day Streak',
    points: 'Points',
    prayersDone: 'Prayers',
    prayerTimes: 'Prayer Times',
    startFocus: 'Start Focus',
    stopFocus: 'Stop',
    resetTimer: 'Reset',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    timeFormat: 'Time Format',
    hour12: '12-hour',
    hour24: '24-hour',
    english: 'English',
    arabic: 'العربية',
    prayerDone: 'Marked as done',
    noTasksYet: 'No tasks yet. Add one below.',
    deleteTask: 'Delete task',
    editTask: 'Edit task',
    save: 'Save',
    cancel: 'Cancel',
    weeklyReview: 'Weekly Review',
    totalTasks: 'Total Tasks',
    focusTime: 'Focus Time',
    minutesFocused: 'min focused today',
    motivationalQuote: 'The strong person is not the one who overcomes others, but the one who controls himself in anger.',
    quoteSource: '— Sahih Al-Bukhari',
    signInTitle: 'Welcome to Mizan',
    signInSubtitle: 'Your Islamic productivity companion',
    loadingPrayers: 'Fetching prayer times...',
    currentPrayer: 'Current',
    nextPrayer: 'Next prayer',
    pomoWork: 'Focus',
    pomoBreak: 'Break',
    pomoLong: 'Long Break',
    duha: 'Duha',
    witr: 'Witr',
    sunnah: 'Sunnah',
    notesTitle: 'Notes & Learnings',
    addNote: 'What did you learn or benefit from today?',
    saveNote: 'Save',
    noNotes: 'No notes yet. Record something you learned.',
    deleteNote: 'Delete',
    catGeneral: 'General',
    catQuran: 'Quran',
    catHadith: 'Hadith',
    catFiqh: 'Fiqh',
    catReminder: 'Reminder',
    dhikrTitle: 'Daily Dhikr',
    dhikrReset: 'Reset',
    dhikrCompleted: 'Completed!',
    quranTitle: 'Read Quran',
    quranSelectSurah: 'Select Surah',
    quranTranslation: 'Translation',
    quranLoading: 'Loading...',
    quranError: 'Failed to load. Try again.',
    quranRetry: 'Retry',
    quranVerse: 'Verse',
    quranBismillah: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    adhkarTitle: 'Morning & Evening Adhkar',
    adhkarMorning: 'Morning Adhkar',
    adhkarEvening: 'Evening Adhkar',
    adhkarSource: 'Source',
    adhkarBenefit: 'Virtue',
    adhkarProgress: 'completed',
    notesPageTitle: 'Notes & Benefits',
    notesSearch: 'Search notes...',
    notesAll: 'All',
    notesEmpty: 'Nothing saved yet.',
    notesSaved: 'Note saved successfully',
    notesSaveError: 'Failed to save. Check your connection.',
    landingHero: 'Balance in All Things',
    landingSubtitle: 'Your Islamic productivity companion — prayers, adhkar, Quran, focus and learning in one place.',
    landingStart: 'Get Started',
    landingFeatures: 'Everything you need',
    landingAbout: 'About',
  },
  ar: {
    appName: 'ميزان',
    tagline: 'التوازن في كل شيء',
    signInWithGoogle: 'المتابعة مع Google',
    signOut: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    today: 'اليوم',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    about: 'حول التطبيق',
    focusMode: 'وضع التركيز',
    addTask: 'أضف مهمة...',
    completed: 'مكتمل',
    pending: 'قيد الانتظار',
    completedToday: 'مكتمل اليوم',
    productivity: 'الإنتاجية',
    streak: 'سلسلة أيام',
    points: 'النقاط',
    prayersDone: 'الصلوات',
    prayerTimes: 'مواقيت الصلاة',
    startFocus: 'ابدأ التركيز',
    stopFocus: 'إيقاف',
    resetTimer: 'إعادة تعيين',
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء النور',
    theme: 'المظهر',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'اللغة',
    timeFormat: 'تنسيق الوقت',
    hour12: '12 ساعة',
    hour24: '24 ساعة',
    english: 'English',
    arabic: 'العربية',
    prayerDone: 'تم التأشير كمنجز',
    noTasksYet: 'لا توجد مهام بعد. أضف واحدة أدناه.',
    deleteTask: 'حذف المهمة',
    editTask: 'تعديل المهمة',
    save: 'حفظ',
    cancel: 'إلغاء',
    weeklyReview: 'المراجعة الأسبوعية',
    totalTasks: 'إجمالي المهام',
    focusTime: 'وقت التركيز',
    minutesFocused: 'دقيقة تركيز اليوم',
    motivationalQuote: 'ليس الشديد بالصُّرَعة، إنما الشديد الذي يملك نفسه عند الغضب.',
    quoteSource: '— صحيح البخاري',
    signInTitle: 'مرحباً بك في ميزان',
    signInSubtitle: 'رفيقك في الإنتاجية الإسلامية',
    loadingPrayers: 'جاري تحميل مواقيت الصلاة...',
    currentPrayer: 'الحالية',
    nextPrayer: 'الصلاة القادمة',
    pomoWork: 'تركيز',
    pomoBreak: 'استراحة',
    pomoLong: 'استراحة طويلة',
    duha: 'الضحى',
    witr: 'الوتر',
    sunnah: 'سُنَّة',
    notesTitle: 'ملاحظاتي والفوائد',
    addNote: 'ماذا تعلمت أو استفدت اليوم؟',
    saveNote: 'حفظ',
    noNotes: 'لا توجد ملاحظات بعد.',
    deleteNote: 'حذف',
    catGeneral: 'عام',
    catQuran: 'قرآن',
    catHadith: 'حديث',
    catFiqh: 'فقه',
    catReminder: 'تذكير',
    dhikrTitle: 'الأذكار اليومية',
    dhikrReset: 'إعادة',
    dhikrCompleted: 'اكتمل!',
    quranTitle: 'اقرأ القرآن',
    quranSelectSurah: 'اختر سورة',
    quranTranslation: 'الترجمة',
    quranLoading: 'جاري التحميل...',
    quranError: 'فشل التحميل. حاول مجدداً.',
    quranRetry: 'إعادة المحاولة',
    quranVerse: 'آية',
    quranBismillah: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    adhkarTitle: 'أذكار الصباح والمساء',
    adhkarMorning: 'أذكار الصباح',
    adhkarEvening: 'أذكار المساء',
    adhkarSource: 'المصدر',
    adhkarBenefit: 'الفضل',
    adhkarProgress: 'مكتملة',
    notesPageTitle: 'ملاحظاتي وفوائدي',
    notesSearch: 'ابحث في الملاحظات...',
    notesAll: 'الكل',
    notesEmpty: 'لا يوجد شيء محفوظ بعد.',
    notesSaved: 'تم الحفظ بنجاح',
    notesSaveError: 'فشل الحفظ. تحقق من اتصالك.',
    landingHero: 'التوازن في كل شيء',
    landingSubtitle: 'رفيقك في الإنتاجية الإسلامية — الصلوات والأذكار والقرآن والتركيز والتعلم في مكان واحد.',
    landingStart: 'ابدأ الآن',
    landingFeatures: 'كل ما تحتاجه',
    landingAbout: 'عن التطبيق',
  }
}
