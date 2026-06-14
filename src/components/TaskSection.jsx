import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, Reorder } from 'motion/react'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { glyph } from './glyphs'
import { startRadarAlarm } from '../utils/alarmSound'
import { requestReminderPermission } from './ReminderNotifier'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtTimer(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function fmt12h(str) {
  if (!str) return ''
  const [h, m] = str.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function to24(h12, min, ampm) {
  let h = h12 % 12
  if (ampm === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function parse12(str) {
  if (!str) return { h12: 12, min: 0, ampm: 'AM' }
  const [h, m] = str.split(':').map(Number)
  return { h12: h % 12 || 12, min: m, ampm: h >= 12 ? 'PM' : 'AM' }
}

// ── Shared dropdown positioning hook ─────────────────────────────────────────
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINS  = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function useDropPos(btnRef, open) {
  const [pos, setPos] = useState(null)
  useLayoutEffect(() => {
    if (!open || !btnRef.current) { setPos(null); return }
    const r = btnRef.current.getBoundingClientRect()
    const flip = window.innerHeight - r.bottom < 270 && r.top > 270
    setPos({
      position: 'fixed',
      left: Math.min(r.left, window.innerWidth - 230),
      ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
    })
  }, [open])
  return pos
}

// ── TimePicker12h ─────────────────────────────────────────────────────────────
export function TimePicker12h({ value, onChange, typeColor, isAr }) {
  const [open, setOpen] = useState(false)
  const btnRef  = useRef(null)
  const dropRef = useRef(null)
  const pos     = useDropPos(btnRef, open)
  const p       = parse12(value)

  useEffect(() => {
    if (!open) return
    const click = e => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false)
    }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc) }
  }, [open])

  const pickerCell = (sel) => ({
    height: 34, borderRadius: 'var(--radius-sm)', border: 'none',
    background: sel ? typeColor : 'var(--bg-input)',
    color: sel ? '#fff' : 'var(--text-primary)', // Use text-primary for non-selected
    fontSize: '0.8rem', fontWeight: sel ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.12s',
  })
  const onHover = (e, on, sel) => {
    if (sel) return
    e.currentTarget.style.background = on ? 'var(--bg-card-hover)' : 'var(--bg-input)'
    e.currentTarget.style.color = on ? typeColor : 'var(--text-secondary)'
  }

  const dropdown = (
    <motion.div
      ref={dropRef}
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      style={{
        ...pos, zIndex: 9999,
        background: 'var(--v-glass-bg)', border: '1px solid var(--v-glass-border)', // Use glass background and border
        borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden', minWidth: 248, direction: isAr ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.125rem 0.75rem',
        background: 'var(--bg-card-hover)',
        borderBottom: `2px solid ${typeColor}`, // Keep dynamic color for border
      }}>
        <div style={{ fontSize: '0.6rem', color: typeColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', fontWeight: 600, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          {isAr ? 'اختر الوقت' : 'Select time'}
        </div>
        <div style={{ fontSize: '1.625rem', fontWeight: 700, color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value ? fmt12h(value) : '—'}
        </div>
      </div>

      <div style={{ padding: '0.75rem' }}>
        {/* Hour grid */}
        <div style={{ marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'ساعة' : 'Hour'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.22rem' }}>
            {HOURS.map(h => {
              const sel = !!value && p.h12 === h
              return (
                <button key={h} type="button" style={pickerCell(sel)}
                  onClick={() => onChange(to24(h, p.min, p.ampm))}
                  onMouseEnter={e => onHover(e, true, sel)} onMouseLeave={e => onHover(e, false, sel)}
                >{h}</button>
              )
            })}
          </div>
        </div>

        {/* Minute grid */}
        <div style={{ marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'دقيقة' : 'Minute'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.22rem' }}>
            {MINS.map(m => {
              const sel = !!value && p.min === m
              return (
                <button key={m} type="button" style={{ ...pickerCell(sel), fontSize: '0.78rem' }}
                  onClick={() => onChange(to24(p.h12, m, p.ampm))}
                  onMouseEnter={e => onHover(e, true, sel)} onMouseLeave={e => onHover(e, false, sel)}
                >{String(m).padStart(2,'0')}</button>
              )
            })}
          </div>
        </div>

        {/* AM / PM */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: value ? '0.5rem' : 0 }}>
          {['AM', 'PM'].map(ap => {
            const sel = !!value && p.ampm === ap
            return (
              <button key={ap} type="button"
                onClick={() => value && onChange(to24(p.h12, p.min, ap))}
                style={{
                  height: 36, borderRadius: 'var(--radius-md)',
                  border: sel ? 'none' : '1px solid var(--border-strong)',
                  background: sel ? typeColor : 'transparent',
                  color: sel ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.875rem', cursor: 'pointer',
                  fontWeight: sel ? 700 : 400, transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (!sel) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = typeColor } }}
                onMouseLeave={e => { if (!sel) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
              >{ap}</button>
            )
          })}
        </div>

        {/* Clear */}
        {value && (
          <button type="button" onClick={() => { onChange(''); setOpen(false) }} style={{
            width: '100%', height: 30, borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-strong)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', // Keep transparent for clear button
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >{isAr ? 'مسح الوقت' : 'Clear time'}</button>
        )}
      </div>
    </motion.div>
  )

  return (
    <span style={{ display: 'inline-block', position: 'relative' }}>
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.375rem 0.875rem',
        background: value ? typeColor : 'var(--bg-input)',
        border: value ? 'none' : '1px solid var(--v-glass-border)', // Use glass border
        borderRadius: 'var(--radius-full)',
        color: value ? '#fff' : 'var(--text-muted)',
        fontSize: '0.82rem', cursor: 'pointer',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        fontWeight: value ? 600 : 400,
        transition: 'all var(--transition)',
      }}>
        {glyph('timer', 12)}{value ? fmt12h(value) : (isAr ? 'ضبط وقت' : 'Set time')}
      </button>
      {open && pos && createPortal(dropdown, document.body)}
    </span>
  )
}

// ── DurationPicker ────────────────────────────────────────────────────────────
const DUR_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const DUR_MINS  = [0, 5, 10, 15, 20, 25, 30, 45]

export function DurationPicker({ value, onChange, typeColor, isAr }) {
  const [open, setOpen] = useState(false)
  const btnRef  = useRef(null)
  const dropRef = useRef(null)
  const pos     = useDropPos(btnRef, open)

  const h = value ? Math.floor(value / 60) : 0
  const m = value ? value % 60 : 0
  const display = value
    ? (h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`)
    : (isAr ? 'المدة' : 'Set duration')

  useEffect(() => {
    if (!open) return
    const click = e => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false)
    }
    const esc = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc) }
  }, [open])

  const upd = (newH, newM) => { const t = newH * 60 + newM; onChange(t > 0 ? t : null) }

  const pickerCell = (sel) => ({
    height: 34, borderRadius: 'var(--radius-sm)', border: 'none',
    background: sel ? typeColor : 'var(--bg-input)',
    color: sel ? '#fff' : 'var(--text-primary)', // Use text-primary for non-selected
    fontSize: '0.8rem', fontWeight: sel ? 600 : 400,
    cursor: 'pointer', transition: 'all 0.12s',
  })
  const onHover = (e, on, sel) => {
    if (sel) return
    e.currentTarget.style.background = on ? 'var(--bg-card-hover)' : 'var(--bg-input)'
    e.currentTarget.style.color = on ? typeColor : 'var(--text-secondary)'
  }

  const dropdown = (
    <motion.div
      ref={dropRef}
      initial={{ opacity: 0, y: -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
      style={{
        ...pos, zIndex: 9999,
        background: 'var(--v-glass-bg)', border: '1px solid var(--v-glass-border)', // Use glass background and border
        borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden', minWidth: 228, direction: isAr ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.125rem 0.75rem',
        background: 'var(--bg-card-hover)',
        borderBottom: `2px solid ${typeColor}`, // Keep dynamic color for border
      }}>
        <div style={{ fontSize: '0.6rem', color: typeColor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem', fontWeight: 600, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          {isAr ? 'اختر المدة' : 'Select duration'}
        </div>
        <div style={{ fontSize: '1.625rem', fontWeight: 700, color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value ? display : '—'}
        </div>
      </div>

      <div style={{ padding: '0.75rem' }}>
        {/* Hours */}
        <div style={{ marginBottom: '0.625rem' }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'ساعات' : 'Hours'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.22rem' }}>
            {DUR_HOURS.map(hr => {
              const sel = !!value && h === hr
              return (
                <button key={hr} type="button" style={pickerCell(sel)}
                  onClick={() => upd(hr, m)}
                  onMouseEnter={e => onHover(e, true, sel)} onMouseLeave={e => onHover(e, false, sel)}
                >{hr === 0 ? '—' : `${hr}h`}</button>
              )
            })}
          </div>
        </div>

        {/* Minutes */}
        <div style={{ marginBottom: value ? '0.5rem' : 0 }}>
          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'دقائق' : 'Minutes'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.22rem' }}>
            {DUR_MINS.map(mn => {
              const sel = !!value && m === mn
              return (
                <button key={mn} type="button" style={pickerCell(sel)}
                  onClick={() => upd(h, mn)}
                  onMouseEnter={e => onHover(e, true, sel)} onMouseLeave={e => onHover(e, false, sel)}
                >{mn === 0 ? '—' : `${mn}m`}</button>
              )
            })}
          </div>
        </div>

        {/* Clear */}
        {value && (
          <button type="button" onClick={() => { onChange(null); setOpen(false) }} style={{
            width: '100%', height: 30, borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-strong)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', // Keep transparent for clear button
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >{isAr ? 'مسح المدة' : 'Clear duration'}</button>
        )}
      </div>
    </motion.div>
  )

  return (
    <span style={{ display: 'inline-block', position: 'relative' }}>
      <button ref={btnRef} type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.375rem 0.875rem',
        background: value ? typeColor : 'var(--bg-input)',
        border: value ? 'none' : '1px solid var(--v-glass-border)', // Use glass border
        borderRadius: 'var(--radius-full)',
        color: value ? '#fff' : 'var(--text-muted)',
        fontSize: '0.82rem', cursor: 'pointer',
        whiteSpace: 'nowrap', fontWeight: value ? 600 : 400,
        transition: 'all var(--transition)',
      }}>
        {glyph('timer', 11)} {display}
      </button>
      {open && pos && createPortal(dropdown, document.body)}
    </span>
  )
}

// ── TaskSection ───────────────────────────────────────────────────────────────
export default function TaskSection({ section, prayerTime }) {
  const { tasks, addTask, editTask, deleteTask, toggleTask, reorderTasks } = useApp()
  const { language, t } = useI18n()
  const [newTaskText,      setNewTaskText]      = useState('')
  const [newTaskDuration,  setNewTaskDuration]  = useState(null)   // number of minutes
  const [newTaskReminder,  setNewTaskReminder]  = useState('')
  const [editingId,  setEditingId]  = useState(null)
  const [editText,   setEditText]   = useState('')
  const [isAdding,   setIsAdding]   = useState(false)
  const [expanded,   setExpanded]   = useState(true)
  const [activeTimer, setActiveTimer] = useState(null)
  const [timerAlert,  setTimerAlert]  = useState(null)
  const inputRef        = useRef(null)
  const timerIntervalRef = useRef(null)
  const activeTimerRef   = useRef(null)
  const alarmStopRef     = useRef(null)
  const alarmTimerRef    = useRef(null)
  const isAr = language === 'ar'

  const sectionTasks = tasks[section.id] || []
  const pendingTasks = sectionTasks.filter(t => !t.completed)
  const doneTasks    = sectionTasks.filter(t => t.completed)
  const label = section.label?.[language] || section.label?.en || section.id

  useEffect(() => () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (alarmStopRef.current)     alarmStopRef.current()
    if (alarmTimerRef.current)    clearTimeout(alarmTimerRef.current)
  }, [])

  const triggerAlarm = (taskText) => {
    if (alarmStopRef.current) alarmStopRef.current()
    clearTimeout(alarmTimerRef.current)
    alarmStopRef.current = startRadarAlarm(8)
    setTimerAlert(taskText)
    alarmTimerRef.current = setTimeout(() => {
      alarmStopRef.current = null; setTimerAlert(null)
    }, 8000)
  }

  const dismissAlarm = () => {
    if (alarmStopRef.current) { alarmStopRef.current(); alarmStopRef.current = null }
    clearTimeout(alarmTimerRef.current); alarmTimerRef.current = null; setTimerAlert(null)
  }

  const startTimer = (task) => {
    if (!task.duration || task.duration <= 0) return
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    const totalSecs = task.duration * 60
    const data = { taskId: task.id, taskText: task.text, totalSeconds: totalSecs, secondsLeft: totalSecs }
    activeTimerRef.current = data; setActiveTimer(data)
    timerIntervalRef.current = setInterval(() => {
      if (!activeTimerRef.current) return
      const next = activeTimerRef.current.secondsLeft - 1
      if (next <= 0) {
        clearInterval(timerIntervalRef.current); timerIntervalRef.current = null
        const text = activeTimerRef.current.taskText
        activeTimerRef.current = null; setActiveTimer(null)
        triggerAlarm(text)
      } else {
        activeTimerRef.current = { ...activeTimerRef.current, secondsLeft: next }
        setActiveTimer({ ...activeTimerRef.current })
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = null; activeTimerRef.current = null; setActiveTimer(null)
  }

  const saveTask = async () => {
    if (!newTaskText.trim()) return
    const reminder = newTaskReminder || null
    try {
      await addTask(section.id, newTaskText, newTaskDuration || null, reminder, null)
      if (reminder) requestReminderPermission()
      setNewTaskText(''); setNewTaskDuration(null); setNewTaskReminder(''); setIsAdding(false)
    } catch (err) {
      console.error('Failed to save task:', err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); saveTask() }
    if (e.key === 'Escape') setIsAdding(false)
  }

  const handleStartEdit = (task) => { setEditingId(task.id); setEditText(task.text) }
  const handleSaveEdit  = async (taskId) => {
    if (editText.trim()) await editTask(taskId, editText.trim())
    setEditingId(null); setEditText('')
  }

  const COLOR_MAP = {
    gold:     ['var(--gold)',     'var(--gold-dim)'],
    emerald:  ['var(--emerald)', 'var(--emerald-dim)'],
    sapphire: ['var(--sapphire)','var(--sapphire-dim)'],
    ruby:     ['var(--ruby)',    'var(--ruby-dim)'],
  }
  const [typeColor, typeDim] = section.color
    ? (COLOR_MAP[section.color] || COLOR_MAP.emerald)
    : section.type === 'prayer' ? COLOR_MAP.gold
    : section.type === 'worship' ? COLOR_MAP.sapphire
    : COLOR_MAP.emerald

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem' }}
    >
      {/* Section Header */}
      <div onClick={() => setExpanded(e => !e)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.875rem 1.25rem', cursor: 'pointer', userSelect: 'none',
        borderBottom: expanded ? '1px solid var(--border)' : 'none',
        transition: 'background var(--transition)',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: typeDim, border: `1px solid ${typeColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
            {section.icon}
          </span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.1rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{label}</span>
              {prayerTime && (
                <span style={{ fontSize: '0.7rem', color: typeColor, background: typeDim, padding: '0.08rem 0.45rem', borderRadius: 99, fontVariantNumeric: 'tabular-nums', border: `1px solid ${typeColor}30` }}>
                  {fmt12h(prayerTime)}
                </span>
              )}
              {!prayerTime && section.startTime && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt12h(section.startTime)}{section.endTime ? ` – ${fmt12h(section.endTime)}` : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {pendingTasks.length} {isAr ? 'معلقة' : 'pending'} · {doneTasks.length} {isAr ? 'مكتملة' : 'done'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sectionTasks.length > 0 && (
            <div style={{ fontSize: '0.7rem', color: typeColor, background: typeDim, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
              {Math.round((doneTasks.length / sectionTasks.length) * 100)}%
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); setIsAdding(true); setExpanded(true) }}
            style={{ width: 26, height: 26, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', lineHeight: 1, transition: 'all var(--transition)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = typeColor; e.currentTarget.style.color = typeColor }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >+</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition)', display: 'inline-block' }}>▼</span>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Timer alert */}
            <AnimatePresence>
              {timerAlert && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ padding: '0.6rem 1.25rem', background: 'var(--emerald-dim)', borderBottom: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--emerald)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}
                >
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.54 }}>⏰</motion.span>
                  <span style={{ flex: 1 }}>{t('timesUp')}{timerAlert ? ` — "${timerAlert}"` : ''}</span>
                  <button onClick={dismissAlarm} style={{ padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.12)', color: 'var(--emerald)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flexShrink: 0 }}>
                    {isAr ? 'إيقاف' : 'Stop'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {pendingTasks.length === 0 && !isAdding ? (
              <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {t('noTasksYet')}
              </div>
            ) : (
              <Reorder.Group axis="y" values={pendingTasks} onReorder={(newOrder) => reorderTasks(section.id, newOrder)} style={{ listStyle: 'none', padding: 0 }}>
                {pendingTasks.map((task) => (
                  <Reorder.Item key={task.id} value={task} style={{ listStyle: 'none' }}>
                    <TaskItem
                      task={task} editingId={editingId} editText={editText} setEditText={setEditText}
                      onToggle={() => toggleTask(task)} onEdit={() => handleStartEdit(task)}
                      onSaveEdit={() => handleSaveEdit(task.id)} onDelete={() => deleteTask(task.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                      typeColor={typeColor} isAr={isAr} t={t}
                      isTimerActive={activeTimer?.taskId === task.id}
                      timerSeconds={activeTimer?.taskId === task.id ? activeTimer.secondsLeft : 0}
                      timerTotal={activeTimer?.taskId === task.id ? activeTimer.totalSeconds : (task.duration ? task.duration * 60 : 0)}
                      onStartTimer={() => startTimer(task)} onStopTimer={stopTimer}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {doneTasks.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '0.25rem 0' }}>
                {doneTasks.map(task => (
                  <TaskItem key={task.id} task={task} editingId={editingId} editText={editText} setEditText={setEditText}
                    onToggle={() => toggleTask(task)} onEdit={() => handleStartEdit(task)}
                    onSaveEdit={() => handleSaveEdit(task.id)} onDelete={() => deleteTask(task.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(task.id); if (e.key === 'Escape') setEditingId(null) }}
                    typeColor={typeColor} isAr={isAr} t={t}
                    isTimerActive={false} timerSeconds={0} timerTotal={0}
                    onStartTimer={() => {}} onStopTimer={() => {}}
                  />
                ))}
              </div>
            )}

            {/* Add task form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ borderTop: '1px solid var(--border)', padding: '0.875rem 1.25rem' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                    {/* Text + buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        ref={inputRef} autoFocus
                        value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder={t('addTask')}
                        style={{
                          flex: 1, background: 'var(--bg-input)',
                          border: `1px solid ${typeColor}40`, borderRadius: 'var(--radius-md)',
                          padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                          color: 'var(--text-primary)', direction: isAr ? 'rtl' : 'ltr', outline: 'none',
                        }}
                      />
                      <button type="button" onClick={saveTask} style={{
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                        background: typeDim, border: `1px solid ${typeColor}40`,
                        color: typeColor, fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', whiteSpace: 'nowrap',
                      }}>{t('save')}</button>
                      <button type="button"
                        onClick={() => { setIsAdding(false); setNewTaskText(''); setNewTaskDuration(null); setNewTaskReminder('') }}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer' }}
                      >✕</button>
                    </div>

                    {/* Duration + Reminder pickers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', direction: isAr ? 'rtl' : 'ltr' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', whiteSpace: 'nowrap' }}>
                          {isAr ? 'المدة:' : 'Duration:'}
                        </span>
                        <DurationPicker value={newTaskDuration} onChange={setNewTaskDuration} typeColor={typeColor} isAr={isAr} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', whiteSpace: 'nowrap' }}>
                          {isAr ? 'تذكير:' : 'Reminder:'}
                        </span>
                        <TimePicker12h value={newTaskReminder} onChange={setNewTaskReminder} typeColor={typeColor} isAr={isAr} />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── TaskItem ──────────────────────────────────────────────────────────────────
function TaskItem({
  task, editingId, editText, setEditText,
  onToggle, onEdit, onSaveEdit, onDelete, onKeyDown,
  typeColor, isAr, t,
  isTimerActive, timerSeconds, timerTotal, onStartTimer, onStopTimer,
}) {
  const isEditing = editingId === task.id
  const [hovered, setHovered] = useState(false)
  const timerProgress = timerTotal > 0 ? 1 - (timerSeconds / timerTotal) : 0
  const circumference = 2 * Math.PI * 9
  const hasDuration = task.duration && task.duration > 0

  const durLabel = hasDuration
    ? (task.duration >= 60
        ? (task.duration % 60 === 0 ? `${task.duration / 60}h` : `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`)
        : `${task.duration}m`)
    : ''

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: isAr ? 8 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isAr ? 8 : -8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', background: hovered ? 'var(--bg-card-hover)' : 'transparent', transition: 'background var(--transition)', cursor: 'default' }}
    >
      {!task.completed && (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'grab', opacity: hovered ? 0.6 : 0, transition: 'opacity var(--transition)', userSelect: 'none', flexShrink: 0 }}>⋮⋮</span>
      )}

      <button onClick={onToggle} style={{
        width: 20, height: 20, flexShrink: 0, borderRadius: 'var(--radius-sm)',
        border: task.completed ? `1.5px solid ${typeColor}` : '1.5px solid var(--border-strong)',
        background: task.completed ? typeColor : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all var(--transition)',
      }}>
        {task.completed && (
          <svg width="11" height="11" viewBox="0 0 12 12">
            <polyline points="2,6 5,9 10,3" fill="none" stroke={task.type === 'prayer' ? '#0a0a0f' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={onSaveEdit} onKeyDown={onKeyDown}
          style={{ flex: 1, background: 'var(--bg-input)', border: `1px solid ${typeColor}40`, borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)', direction: isAr ? 'rtl' : 'ltr' }}
        />
      ) : (
        <span onDoubleClick={onEdit} style={{ flex: 1, fontSize: '0.875rem', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', cursor: 'text', userSelect: 'text' }}>
          {task.text}
        </span>
      )}

      {task.reminderTime && !task.completed && (
        <span style={{ fontSize: '0.68rem', color: 'var(--sapphire)', background: 'var(--sapphire-dim)', padding: '0.1rem 0.4rem', borderRadius: 99, border: '1px solid rgba(99,179,237,0.2)', flexShrink: 0, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {glyph('bell', 11)}{fmt12h(task.reminderTime)}
        </span>
      )}

      {hasDuration && !task.completed && (
        <button onClick={isTimerActive ? onStopTimer : onStartTimer} title={isTimerActive ? t('stopTask') : t('startTask')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', border: isTimerActive ? `1px solid ${typeColor}60` : '1px solid var(--border-strong)', background: isTimerActive ? typeColor + '22' : 'transparent', color: isTimerActive ? typeColor : 'var(--text-muted)', fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums', cursor: 'pointer', transition: 'all var(--transition)', flexShrink: 0, whiteSpace: 'nowrap' }}
          onMouseEnter={e => { if (!isTimerActive) { e.currentTarget.style.borderColor = typeColor; e.currentTarget.style.color = typeColor } }}
          onMouseLeave={e => { if (!isTimerActive) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' } }}
        >
          {isTimerActive ? (
            <>
              <svg width="18" height="18" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle cx="9" cy="9" r="9" fill="none" stroke="var(--border)" strokeWidth="2" />
                <circle cx="9" cy="9" r="9" fill="none" stroke={typeColor} strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timerProgress)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <span>{fmtTimer(timerSeconds)}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>■</span>
            </>
          ) : (
            <><span>▶</span><span>{durLabel}</span></>
          )}
        </button>
      )}

      <div style={{ display: 'flex', gap: '0.25rem', opacity: hovered ? 1 : 0, transition: 'opacity var(--transition)' }}>
        <button onClick={onEdit} title={t('editTask')} style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✎</button>
        <button onClick={onDelete} title={t('deleteTask')}
          style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all var(--transition)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >✕</button>
      </div>
    </motion.div>
  )
}
