import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { getTodayKey } from '../utils/dateUtils'

const DHIKR_LIST = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّهِ',
    transliteration: 'Subhan Allah',
    translation: { en: 'Glory be to Allah', ar: 'تنزيه الله عن كل نقص' },
    target: 33,
    color: 'var(--sapphire)',
    dim: 'var(--sapphire-dim)',
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: { en: 'All praise is due to Allah', ar: 'الشكر والثناء لله' },
    target: 33,
    color: 'var(--emerald)',
    dim: 'var(--emerald-dim)',
  },
  {
    id: 'allahu-akbar',
    arabic: 'ٱللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: { en: 'Allah is the Greatest', ar: 'الله أعظم من كل شيء' },
    target: 34,
    color: 'var(--gold)',
    dim: 'var(--gold-dim)',
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: { en: 'I seek forgiveness from Allah', ar: 'طلب المغفرة من الله' },
    target: 100,
    color: 'var(--ruby)',
    dim: 'var(--ruby-dim)',
  },
  {
    id: 'la-ilaha-illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'La ilaha illallah wahdahu la sharika lah',
    translation: { en: 'There is no god but Allah alone, with no partner', ar: 'إفراد الله بالعبادة' },
    target: 100,
    color: 'var(--amber)',
    dim: 'var(--amber-dim)',
  },
  {
    id: 'subhanallahi-wa-bihamdihi',
    arabic: 'سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ سُبْحَانَ ٱللَّهِ ٱلْعَظِيمِ',
    transliteration: "Subhanallahi wa bihamdihi, Subhanallahil 'Azim",
    translation: { en: 'Glory and praise be to Allah, the Magnificent', ar: 'أحب الكلام إلى الله' },
    target: 100,
    color: 'var(--sapphire)',
    dim: 'var(--sapphire-dim)',
  },
  {
    id: 'salawat',
    arabic: 'ٱللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ',
    transliteration: 'Allahumma salli wa sallim ala nabiyyina Muhammad',
    translation: { en: 'O Allah, send blessings and peace upon Prophet Muhammad ﷺ', ar: 'الصلاة على النبي ﷺ' },
    target: 10,
    color: 'var(--gold)',
    dim: 'var(--gold-dim)',
  },
  {
    id: 'la-hawla',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ ٱلْعَلِيِّ ٱلْعَظِيمِ',
    transliteration: "La hawla wa la quwwata illa billahil 'Aliyyil 'Azim",
    translation: { en: 'No power or strength except with Allah, the Most High, the Magnificent', ar: 'كنز من كنوز الجنة' },
    target: 10,
    color: 'var(--emerald)',
    dim: 'var(--emerald-dim)',
  },
]

export default function DhikrSection() {
  const { language, t } = useApp()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [counts, setCounts] = useState({})
  const [expanded, setExpanded] = useState(true)
  const pendingRef = useRef({})
  const timerRef = useRef(null)

  // Load today's counts from Firestore
  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid, 'dhikr', getTodayKey()))
      if (snap.exists()) setCounts(snap.data())
    }
    load()
    return () => clearTimeout(timerRef.current)
  }, [user])

  const flushToFirestore = (uid, updates) => {
    setDoc(
      doc(db, uid ? `users/${uid}/dhikr` : 'noop', getTodayKey()),
      updates,
      { merge: true }
    )
  }

  const changeCount = (id, delta, target) => {
    setCounts(prev => {
      const next = Math.min(Math.max((prev[id] || 0) + delta, 0), target * 2)
      pendingRef.current[id] = next
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (user) flushToFirestore(user.uid, pendingRef.current)
        pendingRef.current = {}
      }, 800)
      return { ...prev, [id]: next }
    })
  }

  const resetAll = async () => {
    const zeroed = {}
    DHIKR_LIST.forEach(d => { zeroed[d.id] = 0 })
    setCounts(zeroed)
    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'dhikr', getTodayKey()), zeroed, { merge: true })
    }
  }

  const totalDone = DHIKR_LIST.filter(d => (counts[d.id] || 0) >= d.target).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card"
      style={{ // className="glass-card" already handles background, border, border-radius
        borderRadius: '16px', // Mizan token for large cards
        overflow: 'hidden', // Keep overflow hidden
        marginTop: '1.5rem',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: expanded ? '1px solid var(--v-glass-border)' : 'none', // Use glass border
        cursor: 'pointer',
        background: 'var(--v-glass-bg)', // Apply glass background to header
      }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📿</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('dhikrTitle')}
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: totalDone === DHIKR_LIST.length ? 'rgba(102, 181, 255,0.1)' : 'rgba(51, 156, 255,0.1)',
            color: totalDone === DHIKR_LIST.length ? 'var(--mizan-cyan)' : 'var(--mizan-purple)',
            border: `1px solid ${totalDone === DHIKR_LIST.length ? 'rgba(102, 181, 255,0.2)' : 'rgba(51, 156, 255,0.2)'}`,
            borderRadius: 'var(--radius-full)',
            padding: '0.1rem 0.5rem',
          }}>
            {totalDone}/{DHIKR_LIST.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {expanded && (
            <button
              onClick={e => { e.stopPropagation(); resetAll() }}
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.55rem',
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ruby)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {t('dhikrReset')}
            </button>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', transition: 'transform 0.2s', transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', display: 'inline-block' }}>▼</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              background: 'var(--border)',
            }}>
              {DHIKR_LIST.map((dhikr, i) => {
                const count = counts[dhikr.id] || 0
                const done  = count >= dhikr.target
                const pct   = Math.min((count / dhikr.target) * 100, 100)

                return (
                  <motion.div
                    key={dhikr.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      background: done ? `color-mix(in srgb, ${dhikr.dim} 60%, var(--v-glass-bg))` : 'var(--v-glass-bg)',
                      padding: '1.5rem 1.25rem 1.2rem', // Increased padding for better visual
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'background var(--transition)',
                    }}
                  >
                    {/* Progress bar */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0,
                      height: 4, width: `${pct}%`, // Slightly thicker progress bar
                      background: dhikr.color,
                      borderRadius: '0 2px 0 0',
                      transition: 'width 0.3s ease',
                    }} />

                    {/* Arabic text */}
                    <div style={{
                      fontFamily: 'var(--font-arabic)',
                      fontSize: '1.2rem',
                      color: done ? dhikr.color : 'var(--text-primary)', // Keep dynamic color
                      lineHeight: 1.7,
                      direction: 'rtl',
                      textAlign: 'right',
                      transition: 'color var(--transition)',
                    }}>
                      {dhikr.arabic}
                    </div>

                    {/* Transliteration */}
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      direction: 'ltr',
                      textAlign: isAr ? 'right' : 'left',
                    }}>
                      {dhikr.transliteration}
                    </div>

                    {/* Translation */}
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      direction: isAr ? 'rtl' : 'ltr',
                    }}>
                      {dhikr.translation[language] || dhikr.translation.en}
                    </div>

                    {/* Counter row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '0.35rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => changeCount(dhikr.id, -1, dhikr.target)}
                          style={{
                            width: 34, height: 34, // Slightly larger buttons
                            borderRadius: '50%',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1, // Keep line height
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          −
                        </button>

                        {/* Tap/count button */}
                        <button
                          onClick={() => changeCount(dhikr.id, 1, dhikr.target)}
                          style={{
                            padding: '0.4rem 1rem', // Increased padding
                            borderRadius: '10px',
                            border: `1.5px solid ${done ? dhikr.color : 'var(--border-strong)'}`,
                            background: done ? dhikr.dim : 'transparent',
                            color: done ? dhikr.color : 'var(--text-primary)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            fontVariantNumeric: 'tabular-nums',
                            cursor: 'pointer',
                            transition: 'all var(--transition)',
                            minWidth: 56,
                            textAlign: 'center',
                          }}
                          onMouseEnter={e => { if (!done) { e.currentTarget.style.borderColor = dhikr.color; e.currentTarget.style.color = dhikr.color } }}
                          onMouseLeave={e => { if (!done) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                        >
                          {count}
                        </button>

                        <button
                          onClick={() => changeCount(dhikr.id, 1, dhikr.target)}
                          style={{
                            width: 34, height: 34, // Slightly larger buttons
                            borderRadius: '50%',
                            border: `1px solid ${done ? dhikr.color : 'var(--border)'}`,
                            background: done ? dhikr.dim : 'transparent',
                            color: done ? dhikr.color : 'var(--text-muted)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1,
                            transition: 'all var(--transition)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = dhikr.color; e.currentTarget.style.color = dhikr.color }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = done ? dhikr.color : 'var(--border)'; e.currentTarget.style.color = done ? dhikr.color : 'var(--text-muted)' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{
                        fontSize: '0.72rem',
                        color: done ? dhikr.color : 'var(--text-muted)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        fontWeight: done ? 600 : 400,
                      }}>
                        {done ? t('dhikrCompleted') : `${count}/${dhikr.target}`}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
