import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  addDoc, deleteDoc, serverTimestamp, query, where, orderBy, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { fetchPrayerTimes, getMethodForTimezone, getMethodForCountry } from '../utils/prayerTimes'
import { getTodayKey } from '../utils/dateUtils'
import { prayerGlyph } from '../components/prayerIcons'

const AppContext = createContext(null)

const OBLIGATORY_PRAYER_IDS = new Set(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])

// Fixed sections that cannot be deleted
export const FIXED_SECTIONS = [
  { id: 'fajr',    label: { en: 'Fajr',    ar: 'Ø§Ù„ÙØ¬Ø±'  }, type: 'prayer', icon: prayerGlyph('fajr') },
  { id: 'dhuhr',   label: { en: 'Dhuhr',   ar: 'Ø§Ù„Ø¸Ù‡Ø±'  }, type: 'prayer', icon: prayerGlyph('dhuhr') },
  { id: 'asr',     label: { en: 'Asr',     ar: 'Ø§Ù„Ø¹ØµØ±'  }, type: 'prayer', icon: prayerGlyph('asr') },
  { id: 'maghrib', label: { en: 'Maghrib', ar: 'Ø§Ù„Ù…ØºØ±Ø¨' }, type: 'prayer', icon: prayerGlyph('maghrib') },
  { id: 'isha',    label: { en: 'Isha',    ar: 'Ø§Ù„Ø¹Ø´Ø§Ø¡' }, type: 'prayer', icon: prayerGlyph('isha') },
]

export const AppProvider = ({ children }) => {
  const { user, userProfile, updateProfile } = useAuth()

  const [theme] = useState('light') // light is the only theme â€” no toggle, no persistence
  const [timeFormat, setTimeFormat]     = useState('12h')
  const [prayerNotifications, setPrayerNotifications] = useState(true)
  const [scheduleType, setScheduleTypeState]           = useState('prayer')  // 'prayer' | 'custom'
  const [scheduleFrequency, setScheduleFrequencyState] = useState('daily')   // 'daily'  | 'weekly'
  const [scheduleBlocks, setScheduleBlocks]            = useState([])
  const [prayerTimes, setPrayerTimes]   = useState(null)
  const [location, setLocation]         = useState(null)
  const [tasks, setTasks]               = useState({})         // keyed by sectionId
  const [customSections, setCustomSections] = useState([])
  const [completedToday, setCompletedToday] = useState([])
  const [stats, setStats]               = useState({ streak: 0, points: 0 })
  const [goals, setGoals]               = useState([])
  const [gamification, setGamification] = useState({ totalXP: 0, badges: [], streak: 0, lastCompletionDate: null })
  const [donePrayers, setDonePrayers]   = useState({})
  const [loading, setLoading]           = useState(true)
  const [prayerMethod, setPrayerMethod] = useState(null)

  const prayerMethodRef = useRef(null)
  const locationRef     = useRef(null)

  // Only count the 5 obligatory prayers (Duha / Witr are sunnah, excluded from counter)
  const prayersDone = Object.entries(donePrayers)
    .filter(([id, val]) => OBLIGATORY_PRAYER_IDS.has(id) && val === true)
    .length

  // Sync settings from profile
  useEffect(() => {
    if (userProfile) {
      setTimeFormat(userProfile.timeFormat || '12h')
      setPrayerNotifications(userProfile.prayerNotifications !== false) // default true
      setScheduleTypeState(userProfile.scheduleType || 'prayer')
      setScheduleFrequencyState(userProfile.scheduleFrequency || 'daily')
      const savedMethod = userProfile.prayerMethod ?? null
      setPrayerMethod(savedMethod)
      prayerMethodRef.current = savedMethod
    }
  }, [userProfile])

  // Light is the only theme â€” pin the attribute once
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    // fonts now load via index.html @font-face; drop the legacy runtime injection
    document.getElementById('v-os-tokens')?.remove()
  }, [])

  // Resolve the best calculation method for a location.
  // 1. If user already has a saved method, use it.
  // 2. Try browser timezone (instant, no network).
  // 3. Fall back to reverse-geocoding the coordinates.
  const resolveMethod = useCallback(async (latitude, longitude) => {
    if (prayerMethodRef.current !== null) return prayerMethodRef.current

    // Timezone-based detection (instant, no network call)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const tzMethod = getMethodForTimezone(tz)
    if (tzMethod !== null) {
      setPrayerMethod(tzMethod)
      prayerMethodRef.current = tzMethod
      updateProfile({ prayerMethod: tzMethod }).catch(() => {})
      return tzMethod
    }

    // Reverse geocoding fallback for ambiguous/unknown timezones
    try {
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      )
      clearTimeout(tid)
      const geo = await res.json()
      const cc = geo.countryCode?.toUpperCase()
      const method = getMethodForCountry(cc)
      setPrayerMethod(method)
      prayerMethodRef.current = method
      updateProfile({ prayerMethod: method }).catch(() => {})
      return method
    } catch {
      return 3 // Muslim World League â€” safe international default
    }
  }, [updateProfile])

  // Fetch prayer times for current location
  const fetchLocationPrayerTimes = useCallback(async () => {
    const MAKKAH = { latitude: 21.3891, longitude: 39.8579 }

    if (!navigator.geolocation) {
      const method = await resolveMethod(MAKKAH.latitude, MAKKAH.longitude)
      setPrayerTimes(await fetchPrayerTimes(MAKKAH.latitude, MAKKAH.longitude, method))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        locationRef.current = { latitude, longitude }
        setLocation({ latitude, longitude })
        const method = await resolveMethod(latitude, longitude)
        setPrayerTimes(await fetchPrayerTimes(latitude, longitude, method))
      },
      async () => {
        const method = prayerMethodRef.current ?? 3
        setPrayerTimes(await fetchPrayerTimes(MAKKAH.latitude, MAKKAH.longitude, method))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [resolveMethod])

  useEffect(() => { fetchLocationPrayerTimes() }, [fetchLocationPrayerTimes])

  // Re-fetch prayer times when window regains focus (handles moving between cities)
  useEffect(() => {
    let lastFetch = Date.now()
    const onFocus = () => {
      if (Date.now() - lastFetch < 10 * 60 * 1000) return
      lastFetch = Date.now()
      fetchLocationPrayerTimes()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchLocationPrayerTimes])

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

    // Load schedule blocks (custom schedule)
    const blocksRef = collection(db, 'users', user.uid, 'scheduleBlocks')
    const unsubBlocks = onSnapshot(
      query(blocksRef, orderBy('order', 'asc')),
      (snap) => setScheduleBlocks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    // Subscribe to today's prayer completion doc (resets each new day)
    const prayersRef = doc(db, 'users', user.uid, 'prayers', todayKey)
    const unsubPrayers = onSnapshot(prayersRef, (snap) => {
      setDonePrayers(snap.exists() ? snap.data() : {})
    })

    // Load weekly planner goals
    const goalsRef = collection(db, 'users', user.uid, 'goals')
    const unsubGoals = onSnapshot(
      query(goalsRef, orderBy('createdAt', 'desc')),
      snap => setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    // Load gamification data
    const gamRef = doc(db, 'users', user.uid, 'gamification', 'data')
    const unsubGam = onSnapshot(gamRef, snap => {
      if (snap.exists()) setGamification(snap.data())
    })

    return () => {
      unsubTasks()
      unsubCompleted()
      unsubStats()
      unsubSections()
      unsubBlocks()
      unsubPrayers()
      unsubGoals()
      unsubGam()
    }
  }, [user])

  // Kept for API compatibility; the app is light-only so this is inert
  const changeTheme = async () => {}

  const changeTimeFormat = async (fmt) => {
    setTimeFormat(fmt)
    await updateProfile({ timeFormat: fmt })
  }

  const changePrayerNotifications = async (val) => {
    setPrayerNotifications(val)
    await updateProfile({ prayerNotifications: val })
  }

  const changePrayerMethod = async (method) => {
    setPrayerMethod(method)
    prayerMethodRef.current = method
    await updateProfile({ prayerMethod: method })
    const { latitude, longitude } = locationRef.current || { latitude: 21.3891, longitude: 39.8579 }
    setPrayerTimes(await fetchPrayerTimes(latitude, longitude, method))
  }

  const changeScheduleType = async (type) => {
    setScheduleTypeState(type)
    await updateProfile({ scheduleType: type })
  }

  const changeScheduleFrequency = async (freq) => {
    setScheduleFrequencyState(freq)
    await updateProfile({ scheduleFrequency: freq })
  }

  const addScheduleBlock = async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'scheduleBlocks'), {
      ...data,
      order: scheduleBlocks.length,
      createdAt: serverTimestamp(),
    })
  }

  const editScheduleBlock = async (blockId, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'scheduleBlocks', blockId), data)
  }

  const deleteScheduleBlock = async (blockId) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'scheduleBlocks', blockId))
  }

  const reorderScheduleBlocks = async (newOrder) => {
    if (!user) return
    await Promise.all(
      newOrder.map((block, idx) =>
        updateDoc(doc(db, 'users', user.uid, 'scheduleBlocks', block.id), { order: idx })
      )
    )
  }

  const addTask = async (sectionId, text, duration = null, reminderTime = null, scheduledDate = null) => {
    if (!user || !text.trim()) return
    const sectionTasks = tasks[sectionId] || []
    const taskData = {
      sectionId,
      text: text.trim(),
      completed: false,
      date: scheduledDate || getTodayKey(),
      order: sectionTasks.length,
      createdAt: serverTimestamp(),
    }
    if (duration && duration > 0) taskData.duration = duration
    if (reminderTime) taskData.reminderTime = reminderTime
    await addDoc(collection(db, 'users', user.uid, 'tasks'), taskData)
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

  // â”€â”€ Weekly Planner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const _uuid = () =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const addGoal = async ({ title, titleAr, icon, color, deadline = null }) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'goals'), {
      title, titleAr: titleAr || '', icon: icon || 'ðŸŽ¯', color: color || 'gold',
      deadline, milestones: [], createdAt: serverTimestamp(),
    })
  }

  const deleteGoal = async (goalId) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId))
  }

  const addMilestone = async (goalId, text) => {
    if (!user) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const ms = { id: _uuid(), text: text.trim(), completed: false }
    await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
      milestones: [...(goal.milestones || []), ms],
    })
  }

  const deleteMilestone = async (goalId, milestoneId) => {
    if (!user) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), {
      milestones: (goal.milestones || []).filter(m => m.id !== milestoneId),
    })
  }

  const toggleMilestone = async (goalId, milestoneId) => {
    if (!user) return null
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return null
    const ms = (goal.milestones || []).find(m => m.id === milestoneId)
    if (!ms) return null

    const wasCompleted = ms.completed
    const newMilestones = (goal.milestones || []).map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    await updateDoc(doc(db, 'users', user.uid, 'goals', goalId), { milestones: newMilestones })

    if (!wasCompleted) {
      const allDone = newMilestones.length > 0 && newMilestones.every(m => m.completed)
      const xpGain = 10 + (allDone ? 50 : 0)

      const curXP     = gamification.totalXP || 0
      const curBadges = [...(gamification.badges || [])]
      const newTotalXP = curXP + xpGain
      const newBadges  = [...curBadges]

      if (!newBadges.includes('first_step')) newBadges.push('first_step')
      if (allDone && !newBadges.includes('goal_crusher')) newBadges.push('goal_crusher')

      const weekMs = goals
        .filter(g => g.weekStart === goal.weekStart)
        .flatMap(g => g.id === goalId ? newMilestones : (g.milestones || []))
        .filter(m => m.completed).length
      if (weekMs >= 7 && !newBadges.includes('week_warrior')) newBadges.push('week_warrior')

      const weekGoalsDone = goals
        .filter(g => g.weekStart === goal.weekStart)
        .filter(g => {
          const ms2 = g.id === goalId ? newMilestones : (g.milestones || [])
          return ms2.length > 0 && ms2.every(m => m.completed)
        }).length
      if (weekGoalsDone >= 3 && !newBadges.includes('overachiever')) newBadges.push('overachiever')

      const todayStr    = new Date().toISOString().split('T')[0]
      const lastDate    = gamification.lastCompletionDate
      const curStreak   = gamification.streak || 0
      const yesterday   = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const newStreak = lastDate === todayStr ? curStreak
        : lastDate === yesterdayStr ? curStreak + 1
        : 1

      await setDoc(
        doc(db, 'users', user.uid, 'gamification', 'data'),
        { totalXP: newTotalXP, badges: newBadges, streak: newStreak, lastCompletionDate: todayStr },
        { merge: true }
      )

      const levelBefore = Math.floor(curXP / 100) + 1
      const levelAfter  = Math.floor(newTotalXP / 100) + 1
      return {
        xpGain,
        allDone,
        newBadges: newBadges.filter(b => !curBadges.includes(b)),
        leveledUp: levelAfter > levelBefore,
        newLevel: levelAfter,
      }
    } else {
      const xpLoss = 10
      await setDoc(
        doc(db, 'users', user.uid, 'gamification', 'data'),
        { totalXP: Math.max(0, (gamification.totalXP || 0) - xpLoss) },
        { merge: true }
      )
      return null
    }
  }

  return (
    <AppContext.Provider value={{
      theme, changeTheme,
      timeFormat, changeTimeFormat,
      prayerNotifications, changePrayerNotifications,
      prayerMethod, changePrayerMethod,
      scheduleType, scheduleFrequency, scheduleBlocks,
      changeScheduleType, changeScheduleFrequency,
      addScheduleBlock, editScheduleBlock, deleteScheduleBlock, reorderScheduleBlocks,
      prayerTimes, location,
      tasks, customSections,
      completedToday, stats,
      donePrayers, prayersDone,
      addTask, editTask, deleteTask, toggleTask, togglePrayer, reorderTasks,
      goals, gamification,
      addGoal, deleteGoal, addMilestone, deleteMilestone, toggleMilestone,
      loading,
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
