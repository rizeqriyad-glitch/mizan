import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'

const pad = n => String(n).padStart(2, '0')
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayKey = () => keyOf(new Date())

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// index 0 = Sunday … 6 = Saturday (matches Date.getDay)
const WD_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
const WD_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// crimson-carrot heat ramp by activity count
function heat(n) {
  if (!n) return 'var(--surface)'
  if (n <= 1) return 'rgba(164, 169, 193,0.20)'
  if (n <= 2) return 'rgba(164, 169, 193,0.40)'
  if (n <= 4) return 'rgba(164, 169, 193,0.62)'
  return 'rgba(164, 169, 193,0.88)'
}
const heatText = n => (n >= 3 ? '#fff' : 'var(--text)')

function hijri(year, monthIdx, isAr) {
  try {
    return new Intl.DateTimeFormat(isAr ? 'ar-SA-u-ca-islamic' : 'en-US-u-ca-islamic',
      { month: 'long', year: 'numeric' }).format(new Date(year, monthIdx, 15))
  } catch { return '' }
}

export default function DayHistoryPage() {
  const { user } = useAuth()
  const { language } = useI18n()
  const isAr = language === 'ar'
  const thisYear = new Date().getFullYear()

  const [year, setYear] = useState(thisYear)
  const [counts, setCounts] = useState({})
  const [selected, setSelected] = useState(todayKey())
  const [dayItems, setDayItems] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollPending = useRef(false)

  // Year activity → completion count per day (heat map)
  useEffect(() => {
    if (!user) return
    let ignore = false
    setLoading(true)
    ;(async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'users', user.uid, 'completed'),
          where('date', '>=', `${year}-01-01`),
          where('date', '<=', `${year}-12-31`),
        ))
        const c = {}
        snap.docs.forEach(d => { const k = d.data().date; if (k) c[k] = (c[k] || 0) + 1 })
        if (!ignore) setCounts(c)
      } catch (e) { console.error('history counts', e); if (!ignore) setCounts({}) }
      finally { if (!ignore) setLoading(false) }
    })()
    return () => { ignore = true }
  }, [user, year])

  // Selected day → its completed items (detail panel)
  useEffect(() => {
    if (!user) return
    let ignore = false
    ;(async () => {
      try {
        const snap = await getDocs(query(
          collection(db, 'users', user.uid, 'completed'),
          where('date', '==', selected),
        ))
        if (!ignore) setDayItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch { if (!ignore) setDayItems([]) }
    })()
    return () => { ignore = true }
  }, [user, selected])

  // Keyboard navigation between days (RTL-aware); ignores typing in fields
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      const d = new Date(selected + 'T00:00:00')
      const horiz = k === 'ArrowLeft' ? (isAr ? 1 : -1) : k === 'ArrowRight' ? (isAr ? -1 : 1) : 0
      const vert = k === 'ArrowUp' ? -7 : k === 'ArrowDown' ? 7 : 0
      d.setDate(d.getDate() + horiz + vert)
      if (d > new Date()) return
      scrollPending.current = true
      if (d.getFullYear() !== year) setYear(d.getFullYear())
      setSelected(keyOf(d))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, year, isAr])

  // After a keyboard move, bring the focused day into view
  useEffect(() => {
    if (!scrollPending.current) return
    scrollPending.current = false
    const el = document.querySelector(`[data-daykey="${selected}"]`)
    if (el) { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); el.focus({ preventScroll: true }) }
  }, [selected])

  const tKey = todayKey()
  const goToday = () => { scrollPending.current = true; setYear(thisYear); setSelected(tKey) }

  const selDate = new Date(selected + 'T00:00:00')
  const selLabel = selDate.toLocaleDateString(isAr ? 'ar-SA' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', direction: isAr ? 'rtl' : 'ltr', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: 400, fontSize: 'var(--step-3)', lineHeight: 1.1 }}>
              {isAr ? 'تاريخ اليوم' : 'Day History'}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginTop: '0.25rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'سنةٌ من العمل والعبادة، يومًا بيوم' : 'A year of work and worship, day by day'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-ui" onClick={goToday} style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'اليوم' : 'Today'}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button className="btn-ui" aria-label={isAr ? 'السنة السابقة' : 'Previous year'} onClick={() => setYear(y => y - 1)} style={{ padding: '0.4rem 0.7rem' }}>
                <span className="rtl-flip" aria-hidden="true">‹</span>
              </button>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '1.1rem', minWidth: '4ch', textAlign: 'center' }}>{year}</span>
              <button className="btn-ui" aria-label={isAr ? 'السنة التالية' : 'Next year'} onClick={() => setYear(y => Math.min(y + 1, thisYear))} disabled={year >= thisYear} style={{ padding: '0.4rem 0.7rem', opacity: year >= thisYear ? 0.4 : 1 }}>
                <span className="rtl-flip" aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        </div>

        {/* 12-month annual grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(238px, 1fr))', gap: '1rem' }}>
          {MONTHS_AR.map((_, m) => (
            <MonthCard key={m} year={year} month={m} isAr={isAr} counts={counts} selected={selected} todayK={tKey} onPick={(key) => { scrollPending.current = false; setSelected(key) }} />
          ))}
        </div>

        {/* Selected-day detail */}
        <div style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display-sm)' }}>{selLabel}</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{hijri(selDate.getFullYear(), selDate.getMonth(), isAr)}</span>
          </div>
          {dayItems.length === 0 ? (
            <div role="status" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-3)', border: '1px dashed var(--border-2)', borderRadius: 'var(--radius-lg)', fontSize: '0.9rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {loading ? (isAr ? 'جاري التحميل...' : 'Loading…') : (isAr ? 'لا يوجد نشاط مسجّل في هذا اليوم.' : 'No recorded activity on this day.')}
            </div>
          ) : (
            <motion.ul initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.6rem' }}>
              {dayItems.map(it => (
                <li key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 0.9rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <span aria-hidden="true" style={{ color: 'var(--primary)', fontSize: '0.8rem', flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: '0.88rem', flex: 1, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{it.text || it.taskId}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  )
}

function MonthCard({ year, month, isAr, counts, selected, todayK, onPick }) {
  const first = new Date(year, month, 1).getDay()        // 0 Sun … 6 Sat
  const days = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  const wd = isAr ? WD_AR : WD_EN

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{(isAr ? MONTHS_AR : MONTHS_EN)[month]}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{hijri(year, month, isAr)}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '3px' }}>
        {wd.map((w, i) => <span key={i} style={{ textAlign: 'center', fontSize: '0.56rem', color: 'var(--text-3)', padding: '2px 0' }}>{w}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />
          const key = `${year}-${pad(month + 1)}-${pad(d)}`
          const n = counts[key] || 0
          const isToday = key === todayK
          const isSel = key === selected
          const future = key > todayK
          return (
            <button
              key={i}
              type="button"
              data-daykey={key}
              onClick={() => onPick(key)}
              disabled={future}
              aria-label={`${d} — ${n} ${isAr ? 'مكتمل' : 'completed'}`}
              aria-current={isSel ? 'date' : undefined}
              title={`${n} ${isAr ? 'مكتمل' : 'completed'}`}
              style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontVariantNumeric: 'tabular-nums',
                borderRadius: '5px', cursor: future ? 'default' : 'pointer',
                background: heat(n), color: heatText(n), opacity: future ? 0.3 : 1,
                border: isSel ? '1.5px solid var(--primary)' : isToday ? '1.5px solid var(--border-2)' : '1.5px solid transparent',
                transition: 'transform .12s var(--ease-out)',
              }}
            >{d}</button>
          )
        })}
      </div>
    </div>
  )
}
