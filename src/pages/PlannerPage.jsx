import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { TimePicker12h, DurationPicker } from '../components/TaskSection'
import { prayerGlyph } from '../components/prayerIcons'
import { glyph } from '../components/glyphs'

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = ['gold', 'emerald', 'sapphire', 'ruby']
const COLOR_CSS = {
  gold:     { main: 'var(--gold)',     dim: 'var(--gold-dim)' },
  emerald:  { main: 'var(--emerald)',  dim: 'var(--emerald-dim)' },
  sapphire: { main: 'var(--sapphire)', dim: 'var(--sapphire-dim)' },
  ruby:     { main: 'var(--ruby)',     dim: 'var(--ruby-dim)' },
}

const BADGES_DEF = [
  { id: 'first_step',   icon: glyph('target'), en: 'First Step',   ar: 'الخطوة الأولى' },
  { id: 'goal_crusher', icon: glyph('trophy'), en: 'Goal Crusher', ar: 'محطم الأهداف' },
  { id: 'week_warrior', icon: glyph('swords'), en: 'Week Warrior', ar: 'محارب الأسبوع' },
  { id: 'overachiever', icon: glyph('rocket'), en: 'Overachiever', ar: 'المتفوق' },
]

const THRESHOLDS = [0.25, 0.5, 0.75, 1.0]
const THRESHOLD_ICON = { 0.25: glyph('sprout', 12), 0.5: glyph('streak', 12), 0.75: glyph('zap', 12), 1.0: glyph('trophy', 12) }

const FILTERS = ['all', 'active', 'overdue', 'done']

const DAY_LIST = [
  { key: 'sun', en: 'Sun', ar: 'الأحد'     },
  { key: 'mon', en: 'Mon', ar: 'الاثنين'   },
  { key: 'tue', en: 'Tue', ar: 'الثلاثاء'  },
  { key: 'wed', en: 'Wed', ar: 'الأربعاء'  },
  { key: 'thu', en: 'Thu', ar: 'الخميس'    },
  { key: 'fri', en: 'Fri', ar: 'الجمعة'    },
  { key: 'sat', en: 'Sat', ar: 'السبت'     },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function daysUntil(deadline) {
  if (!deadline) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d     = new Date(deadline + 'T00:00:00')
  return Math.round((d - today) / 86400000)
}

function formatDeadline(deadline, language) {
  if (!deadline) return null
  const d = new Date(deadline + 'T00:00:00')
  return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function getLevel(totalXP = 0) {
  const level = Math.floor(totalXP / 100) + 1
  const xpInLevel = totalXP % 100
  return { level, xpInLevel, xpToNext: 100 - xpInLevel, pct: xpInLevel }
}

function isGoalDone(goal) {
  const ms = goal.milestones || []
  return ms.length > 0 && ms.every(m => m.completed)
}

function sortGoals(goals) {
  return [...goals].sort((a, b) => {
    // Completed go last
    const aDone = isGoalDone(a), bDone = isGoalDone(b)
    if (aDone !== bDone) return aDone ? 1 : -1

    // No deadline goes after goals with deadlines
    if (!a.deadline && b.deadline) return 1
    if (a.deadline && !b.deadline) return -1
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline)

    // Same deadline or both null: newer first
    return 0
  })
}

// ── XPBar ─────────────────────────────────────────────────────────────────────
function XPBar({ gamification, isAr }) {
  const { level, xpInLevel, xpToNext, pct } = getLevel(gamification.totalXP || 0)
  const earnedBadges = (gamification.badges || [])
    .map(id => BADGES_DEF.find(b => b.id === id))
    .filter(Boolean)
  const streak = gamification.streak || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="glass-card"
      style={{
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      }}
    >
      {/* Level badge */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(29, 127, 226,0.1)', border: '2px solid var(--mizan-purple)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.55rem', color: 'var(--gold)', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.04em' }}>
          {isAr ? 'مستوى' : 'LEVEL'}
        </span>
        <span style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>{level}</span>
      </div>

      {/* XP bar */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {gamification.totalXP || 0} XP
              </span> {/* XP value */}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {xpToNext} {isAr ? 'للمستوى التالي' : 'to next level'}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{ // Progress bar
              height: '100%', // This is a progress bar, so it's fine to use a gradient.
              background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
              borderRadius: 99, minWidth: pct > 0 ? 6 : 0,
            }}
          />
        </div>
      </div>

      {/* Streak */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.4rem 0.875rem',
        background: streak > 0 ? 'rgba(29, 127, 226,0.1)' : 'var(--bg-input)',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${streak > 0 ? 'rgba(134, 141, 172,0.35)' : 'var(--border)'}`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>{streak > 0 ? glyph('streak') : glyph('moon')}</span>
        <div style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: streak > 0 ? 'rgb(251,146,60)' : 'var(--text-muted)' }}>{streak}</span>
          <span style={{ fontSize: '0.72rem', color: streak > 0 ? 'rgba(134, 141, 172,0.8)' : 'var(--text-muted)', marginLeft: '0.3rem' }}>
            {isAr ? 'يوم' : streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {earnedBadges.map(b => (
            <div key={b.id} title={isAr ? b.ar : b.en} style={{
              padding: '0.28rem 0.55rem', background: 'var(--bg-input)',
              borderRadius: '9999px', border: '1px solid var(--v-glass-border)', // Mizan token for full-pill
              fontSize: '0.9rem', cursor: 'default', userSelect: 'none',
            }}>
              {b.icon}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── DeadlineBadge ─────────────────────────────────────────────────────────────
function DeadlineBadge({ deadline, isAr, done }) {
  if (!deadline) return (
    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
      {isAr ? 'بدون موعد' : 'No deadline'}
    </span>
  )

  const days = daysUntil(deadline)
  const label = formatDeadline(deadline, isAr ? 'ar' : 'en')

  let color, bg, text
  if (done) {
    color = 'var(--emerald)'; bg = 'var(--emerald-dim)'
    text = isAr ? `مكتمل · ${label}` : `Done · ${label}`
  } else if (days < 0) {
    color = 'var(--ruby)'; bg = 'var(--ruby-dim)'
    const absDays = Math.abs(days)
    text = isAr ? `متأخر ${absDays} يوم` : `${absDays}d overdue`
  } else if (days === 0) {
    color = 'var(--gold)'; bg = 'var(--gold-dim)'
    text = isAr ? 'اليوم!' : 'Today!'
  } else if (days <= 3) {
    color = 'var(--gold)'; bg = 'var(--gold-dim)'
    text = isAr ? `${days} أيام` : `${days}d left`
  } else {
    color = 'var(--text-muted)'; bg = 'var(--bg-input)'
    text = label
  }

  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 500, color, background: bg,
      padding: '0.18rem 0.55rem', borderRadius: 99,
      border: `1px solid ${color}40`, // This color is dynamic, so it's fine. // Keep dynamic color
      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
      whiteSpace: 'nowrap',
    }}>
      {days !== null && days >= 0 && !done ? <>{glyph('calendar', 11)} </> : null}{text}
    </span>
  )
}

// ── GoalCard ──────────────────────────────────────────────────────────────────
function GoalCard({ goal, isAr, onToggle, onAddMilestone, onDeleteMilestone, onDelete }) {
  const [showInput, setShowInput] = useState(false)
  const [newMs, setNewMs]         = useState('')

  const color      = COLOR_CSS[goal.color] || COLOR_CSS.gold
  const milestones = goal.milestones || []
  const done       = milestones.filter(m => m.completed).length
  const total      = milestones.length
  const progress   = total > 0 ? done / total : 0
  const goalDone   = isGoalDone(goal)

  const handleAdd = async () => {
    if (!newMs.trim()) return
    await onAddMilestone(goal.id, newMs.trim())
    setNewMs(''); setShowInput(false)
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      style={{
        borderRadius: '16px',
        background: 'var(--bg-card)',
        border: `1px solid ${goalDone ? 'rgba(23, 102, 181,0.2)' : 'var(--v-glass-border)'}`,
        borderTop: `3px solid ${goalDone ? 'var(--emerald)' : color.main}`,
        boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: goalDone ? 0.75 : 1,
      }}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.65rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{goal.icon || '🎯'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600, color: goalDone ? 'var(--text-muted)' : 'var(--text-primary)',
            fontSize: '0.95rem', lineHeight: 1.3,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            textDecoration: goalDone ? 'line-through' : 'none',
          }}>
            {isAr && goal.titleAr ? goal.titleAr : goal.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {done}/{total} {isAr ? 'مكتملة' : 'complete'}
            </span>
            <DeadlineBadge deadline={goal.deadline} isAr={isAr} done={goalDone} />
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)}
          style={{
            width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)',
            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', // This button is small, so it's fine. // Keep transparent
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            flexShrink: 0, transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)'; e.currentTarget.style.background = 'var(--ruby-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >×</button>
      </div>

      {/* Progress bar + checkpoints */}
      <div style={{ padding: '0 1.25rem 0.875rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.55rem' }}>
          <motion.div // This is a progress bar, so it's fine to use a gradient. // Keep progress bar
            animate={{ width: `${Math.max(progress * 100, progress > 0 ? 1 : 0)}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{ height: '100%', background: goalDone ? 'var(--emerald)' : color.main, borderRadius: 99 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {THRESHOLDS.map(thresh => {
            const reached = progress >= thresh
            const c = goalDone ? { main: 'var(--emerald)', dim: 'var(--emerald-dim)' } : color
            return (
              <div key={thresh} style={{
                padding: '0.18rem 0.5rem', borderRadius: 99,
                background: reached ? c.dim : 'rgba(255,255,255,0.05)',
                border: `1px solid ${reached ? c.main + '55' : 'var(--border)'}`,
                fontSize: '0.65rem', fontWeight: reached ? 600 : 400,
                color: reached ? c.main : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: '0.2rem',
                transition: 'all 0.3s', userSelect: 'none',
              }}>
                {reached ? <span>{THRESHOLD_ICON[thresh]}</span> : null}
                {Math.round(thresh * 100)}%
              </div>
            )
          })}
        </div>
      </div>

      {/* Milestone list */}
      <div style={{ flex: 1, padding: '0.25rem 0' }}>
        <AnimatePresence initial={false}>
          {milestones.map(ms => (
            <motion.div key={ms.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.42rem 1.25rem' }}>
                <button
                  onClick={() => onToggle(goal.id, ms.id, milestones)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${ms.completed ? (goalDone ? 'var(--mizan-cyan)' : color.main) : 'var(--v-glass-border)'}`,
                    background: ms.completed ? (goalDone ? 'var(--emerald)' : color.main) : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.6rem', fontWeight: 700, transition: 'all 0.2s',
                  }}
                >{ms.completed ? '✓' : ''}</button>
                <span style={{
                  flex: 1, fontSize: '0.85rem',
                  color: ms.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: ms.completed ? 'line-through' : 'none',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', transition: 'all 0.2s',
                }}>{ms.text}</span>
                <button onClick={() => onDeleteMilestone(goal.id, ms.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.95rem', padding: '0.1rem 0.25rem', opacity: 0, transition: 'opacity var(--transition)', lineHeight: 1 }}
                  className="ms-del">×</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {milestones.length === 0 && !showInput && (
          <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'لا توجد مهام فرعية بعد.' : 'No milestones yet.'}
          </div>
        )}
      </div>

      {/* Add milestone */}
      {!goalDone && (
        <div style={{ padding: '0.5rem 1.25rem 0.875rem', borderTop: '1px solid var(--border)' }}>
          {showInput ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input value={newMs} onChange={e => setNewMs(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowInput(false); setNewMs('') } }}
                placeholder={isAr ? 'اكتب مهمة فرعية...' : 'Type a milestone...'} // Input field
                autoFocus
                style={{
                  flex: 1, background: 'var(--bg-input)', border: `1px solid ${color.main}60`,
                  borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem',
                  color: 'var(--text-primary)', fontSize: '0.83rem', outline: 'none',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}
              />
              <button onClick={handleAdd} style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', border: 'none', background: color.main, color: 'var(--bg-base)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>+</button>
              <button onClick={() => { setShowInput(false); setNewMs('') }} style={{ padding: '0.4rem 0.6rem', borderRadius: '10px', border: '1px solid var(--v-glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer' }}>✕</button>
            </div>
            ) : (
            <button onClick={() => setShowInput(true)}
              style={{
                width: '100%', padding: '0.42rem', borderRadius: 'var(--radius-md)',
                border: `1px dashed ${color.main}50`, background: 'transparent', color: color.main,
                fontSize: '0.78rem', cursor: 'pointer', transition: 'all var(--transition)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', opacity: 0.65,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}
            >
              + {isAr ? 'إضافة مهمة فرعية' : 'Add milestone'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ── AddGoalModal ──────────────────────────────────────────────────────────────
function AddGoalModal({ onClose, onAdd, isAr }) {
  const [title,    setTitle]    = useState('')
  const [titleAr,  setTitleAr]  = useState('')
  const [icon,     setIcon]     = useState('🎯')
  const [color,    setColor]    = useState('gold')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await onAdd({ title: title.trim(), titleAr: titleAr.trim(), icon: icon || '🎯', color, deadline: deadline || null })
  }

  const c = COLOR_CSS[color]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--v-glass-bg)', borderRadius: '16px',
          border: `1px solid ${c.main}40`, borderTop: `3px solid ${c.main}`, // This border is dynamic, so it's fine.
          width: '100%', maxWidth: 460, overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'إضافة هدف جديد' : 'New Goal'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}>×</button> {/* Small button, fine. // Keep small button */}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Icon + color */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {isAr ? 'أيقونة' : 'Icon'}
              </label>
              <input value={icon} onChange={e => setIcon(e.target.value.slice(-2) || '🎯')} maxLength={2} // Input field
                style={{ width: 54, height: 46, textAlign: 'center', fontSize: '1.55rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'text', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {isAr ? 'اللون' : 'Color'}
              </label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {COLORS.map(col => (
                  <button key={col} type="button" onClick={() => setColor(col)} // Color picker buttons
                    style={{ width: 30, height: 30, borderRadius: '50%', background: COLOR_CSS[col].main, border: 'none', cursor: 'pointer', outline: color === col ? '3px solid var(--text-primary)' : '3px solid transparent', outlineOffset: 2, transition: 'outline 0.15s' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'عنوان الهدف' : 'Goal Title'} <span style={{ color: c.main }}>*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} required autoFocus // Input field
              placeholder={isAr ? 'مثال: إتقان لغة جديدة' : 'e.g. Learn a new skill'}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: `1px solid ${title ? c.main + '80' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '0.55rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            />
          </div>

          {/* Arabic title */}
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'العنوان بالعربية' : 'Arabic Title'} <span style={{ opacity: 0.5 }}>({isAr ? 'اختياري' : 'optional'})</span>
            </label>
            <input value={titleAr} onChange={e => setTitleAr(e.target.value)} dir="rtl" // Input field
              placeholder={isAr ? 'عنوان الهدف بالعربية' : 'العنوان بالعربية'}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.55rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          {/* Deadline */}
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {glyph('calendar', 12)} {isAr ? 'الموعد النهائي' : 'Target Date'} <span style={{ opacity: 0.5 }}>({isAr ? 'اختياري' : 'optional'})</span>
            </label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} // Input field
              min={todayStr()}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: `1px solid ${deadline ? c.main + '80' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '0.55rem 0.875rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', colorScheme: 'light', transition: 'border-color 0.2s' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: '0.25rem' }}> {/* Action buttons */}
            <button type="button" onClick={onClose}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit"
              style={{ padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', background: c.main, color: 'var(--bg-base)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'إضافة الهدف' : 'Add Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt12h(str) {
  if (!str) return ''
  const [h, m] = str.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDur(mins) {
  if (!mins || mins <= 0) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`
}

// ── localDateStr ──────────────────────────────────────────────────────────────
function localDateStr(d = new Date()) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// ── InlineTaskForm ─────────────────────────────────────────────────────────────
function InlineTaskForm({ sectionId, dayStr, accentColor, isAr, addTask, onClose }) {
  const [text,     setText]     = useState('')
  const [reminder, setReminder] = useState('')
  const [duration, setDuration] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await addTask(sectionId, text.trim(), duration || null, reminder || null, dayStr)
    } finally { setSaving(false) }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{ overflow: 'hidden' }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}08 0%, transparent 100%)`,
        borderTop: `1px solid ${accentColor}25`,
        padding: '0.875rem 1.25rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && text.trim()) handleSave(); if (e.key === 'Escape') onClose() }}
          placeholder={isAr ? 'وصف المهمة...' : 'Task description...'}
          autoFocus
          style={{
            background: 'var(--bg-input)',
            border: `1.5px solid ${text.trim() ? accentColor + 'aa' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)', padding: '0.6rem 0.875rem',
            color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            transition: 'border-color 0.2s', width: '100%', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'التذكير' : 'Reminder'}
            </div>
            <TimePicker12h value={reminder} onChange={setReminder} typeColor={accentColor} isAr={isAr} />
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'المدة' : 'Duration'}
            </div>
            <DurationPicker value={duration} onChange={setDuration} typeColor={accentColor} isAr={isAr} />
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button onClick={onClose} style={{
              padding: '0.42rem 0.875rem', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
            <button onClick={handleSave} disabled={!text.trim() || saving} style={{
              padding: '0.42rem 1.1rem', borderRadius: 'var(--radius-md)', border: 'none',
              background: text.trim() ? accentColor : 'var(--bg-input)',
              color: text.trim() ? 'white' : 'var(--text-muted)',
              fontSize: '0.8rem', fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'default',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              transition: 'all 0.15s',
            }}>{saving ? '...' : (isAr ? 'حفظ' : 'Save')}</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── SectionCard ───────────────────────────────────────────────────────────────
function SectionCard({ section, tasks, dayStr, isAr, language, accentColor, prayerTime, onToggle, onDelete, addTask }) {
  const [showForm, setShowForm] = useState(false)

  const name  = section.label?.[language] || section.label?.en || section.name || section.id
  const done  = tasks.filter(t => t.completed).length
  const total = tasks.length

  return (
    <motion.div layout style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: `1px solid ${accentColor}30`, // This border is dynamic, so it's fine. // Keep dynamic border
      overflow: 'hidden',
      marginBottom: '0.75rem',
      boxShadow: `0 2px 12px ${accentColor}0a`,
    }}>
      {/* Clickable header — opens task form */}
      <div
        onClick={() => setShowForm(o => !o)}
        style={{
          padding: '0.9rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          cursor: 'pointer', userSelect: 'none',
          borderBottom: (tasks.length > 0 || showForm) ? `1px solid ${accentColor}18` : 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = accentColor + '08'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Icon */} {/* This is a glass-icon-mizan candidate */}
        <div style={{
          width: 38, height: 38, borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: accentColor + '18', border: `1px solid ${accentColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          {section.icon || (section.type === 'prayer' ? glyph('mosque') : glyph('clipboard'))}
        </div>

        {/* Name + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {name}
            </span> {/* Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            {prayerTime && (
              <span style={{ fontSize: '0.67rem', color: accentColor, background: accentColor + '18', padding: '0.06rem 0.48rem', borderRadius: 99, border: `1px solid ${accentColor}35`, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                {prayerTime}
              </span>
            )} {/* These are badges, fine. */}
            {!prayerTime && section.startTime && (
              <span style={{ fontSize: '0.67rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.06rem 0.48rem', borderRadius: 99, fontVariantNumeric: 'tabular-nums' }}>
                {fmt12h(section.startTime)}{section.endTime ? ` – ${fmt12h(section.endTime)}` : ''}
              </span>
            )}
            {total > 0 && (
              <span style={{ fontSize: '0.67rem', color: done === total ? 'var(--emerald)' : 'var(--text-muted)', background: done === total ? 'var(--emerald-dim)' : 'var(--bg-input)', padding: '0.06rem 0.48rem', borderRadius: 99, fontVariantNumeric: 'tabular-nums', fontWeight: done === total ? 600 : 400 }}>
                {done}/{total} {isAr ? 'مهام' : 'tasks'}
              </span>
            )}
          </div>
        </div>

        {/* +/× toggle */}
        <div style={{ // This is a button, but it's small and part of the card header.
          width: 32, height: 32, borderRadius: 'var(--radius-md)', flexShrink: 0,
          border: `1.5px solid ${showForm ? accentColor : accentColor + '50'}`,
          background: showForm ? accentColor : 'transparent',
          color: showForm ? 'white' : accentColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: showForm ? '1.1rem' : '1.3rem', fontWeight: 300, lineHeight: 1,
          transition: 'all 0.2s',
        }}>
          {showForm ? '×' : '+'}
        </div>
      </div>

      {/* Task list — always visible */}
      <AnimatePresence initial={false}>
        {tasks.map(task => (
          <motion.div key={task.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 1.25rem' }}> {/* Task item */}
              <button onClick={() => onToggle(task)} style={{ // Checkbox button
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: task.completed ? `2px solid ${accentColor}` : '2px solid var(--border-strong)',
                background: task.completed ? accentColor : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', color: 'white', fontSize: '0.6rem', fontWeight: 700,
              }}>{task.completed ? '✓' : ''}</button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.text}
                </div>
                {(task.reminderTime || task.duration > 0) && !task.completed && (
                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                    {task.reminderTime && ( // Reminder badge
                      <span style={{ fontSize: '0.62rem', color: 'var(--mizan-cyan)', background: 'rgba(23, 102, 181,0.1)', padding: '0.05rem 0.4rem', borderRadius: 99 }}>{glyph('bell', 11)}{fmt12h(task.reminderTime)}</span> // Mizan cyan
                    )}
                    {task.duration > 0 && ( // Duration badge
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.05rem 0.4rem', borderRadius: 99 }}>{glyph('timer', 11)}{fmtDur(task.duration)}</span> // Glass background
                    )}
                  </div>
                )}
              </div>
              <button onClick={e => { e.stopPropagation(); onDelete(task.id) }}
                style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Inline task form */}
      <AnimatePresence>
        {showForm && (
          <InlineTaskForm
            key="form"
            sectionId={section.id}
            dayStr={dayStr}
            accentColor={accentColor}
            isAr={isAr}
            addTask={addTask}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── SectionGroupHeader ────────────────────────────────────────────────────────
function SectionGroupHeader({ icon, label, color, note, onClick, expanded, count }) {
  const clickable = typeof onClick === 'function'
  if (clickable) {
    return (
      <div
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '0.875rem 1.25rem',
          marginBottom: '1rem',
          background: 'var(--bg-card)',
          border: `1px solid ${color}35`, // This border is dynamic, so it's fine.
          borderTop: `3px solid ${color}`,
          borderRadius: 'var(--radius-lg)',
          cursor: 'pointer', userSelect: 'none',
          boxShadow: `0 2px 10px ${color}0d`,
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = color + '0c'
          e.currentTarget.style.boxShadow = `0 4px 16px ${color}20`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-card)'
          e.currentTarget.style.boxShadow = `0 2px 10px ${color}0d`
        }}
      >
        {/* Icon badge */}
        <div className="glass-icon-mizan" style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: color + '20', border: `1px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
        }}>
          {icon}
        </div>

        {/* Label + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color, lineHeight: 1.2 }}>
            {label}
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {note && (
              <span style={{ fontSize: '0.62rem', color: 'var(--ruby)', background: 'var(--ruby-dim)', padding: '0.06rem 0.45rem', borderRadius: 99 }}>
                {note} {/* This is a badge, fine. */}
              </span>
            )}
            {count !== undefined && count > 0 && (
              <span style={{ fontSize: '0.62rem', color, background: color + '18', padding: '0.06rem 0.45rem', borderRadius: 99, fontWeight: 600 }}>
                {count}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ // This is a button, but it's small and part of the header.
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${color}40`,
          background: expanded ? color + '18' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all 0.2s',
        }}>
          <span style={{
            fontSize: '0.8rem', color, lineHeight: 1,
            transition: 'transform 0.25s', display: 'inline-block',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>▾</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <div style={{ width: 3, height: 20, background: color, borderRadius: 99, flexShrink: 0 }} />
      <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>
        {icon} {label}
      </span> {/* This is a section header, fine. */}
      {note && (
        <span style={{ fontSize: '0.62rem', color: 'var(--ruby)', background: 'var(--ruby-dim)', padding: '0.08rem 0.45rem', borderRadius: 99 }}>
          {note}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: color + '25', marginInlineStart: '0.25rem' }} />
    </div>
  )
}

// ── PRAYER_COLS ───────────────────────────────────────────────────────────────
const PRAYER_COLS = [
  { id: 'fajr',    icon: prayerGlyph('fajr'),    en: 'Fajr',    ar: 'الفجر',   color: 'sapphire' },
  { id: 'dhuhr',   icon: prayerGlyph('dhuhr'),   en: 'Dhuhr',   ar: 'الظهر',   color: 'gold'     },
  { id: 'asr',     icon: prayerGlyph('asr'),     en: 'Asr',     ar: 'العصر',   color: 'emerald'  },
  { id: 'maghrib', icon: prayerGlyph('maghrib'), en: 'Maghrib',  ar: 'المغرب',  color: 'ruby'     },
  { id: 'isha',    icon: prayerGlyph('isha'),    en: 'Isha',    ar: 'العشاء',  color: 'sapphire' },
]

const FULL_DAYS = [
  { key: 'sun', en: 'Sunday',    ar: 'الأحد'     },
  { key: 'mon', en: 'Monday',    ar: 'الاثنين'   },
  { key: 'tue', en: 'Tuesday',   ar: 'الثلاثاء'  },
  { key: 'wed', en: 'Wednesday', ar: 'الأربعاء'  },
  { key: 'thu', en: 'Thursday',  ar: 'الخميس'    },
  { key: 'fri', en: 'Friday',    ar: 'الجمعة'    },
  { key: 'sat', en: 'Saturday',  ar: 'السبت'     },
]

// ── AddScheduleTaskModal ──────────────────────────────────────────────────────
function AddScheduleTaskModal({ mode, onAdd, onEdit, onClose, isAr, prayerTimes, defaultDay, defaultDate, editItem }) {
  const isEditMode = !!editItem
  const [text,         setText]     = useState(editItem?.text || '')
  const [icon,         setIcon]     = useState(editItem?.icon || '📋')
  const [color,        setColor]    = useState(editItem?.color || 'sapphire')
  const [duration,     setDuration] = useState(editItem?.duration || null)
  const [reminderTime, setReminder] = useState(editItem?.reminderTime || '')
  const [selectedDays, setDays]     = useState(editItem?.days || (defaultDay ? [defaultDay] : []))
  const [selectedDate, setDate]     = useState(editItem?.date || defaultDate || localDateStr())
  const [prayerId,     setPrayerId] = useState(editItem?.prayerId || 'fajr')
  const [saving,       setSaving]   = useState(false)

  const c = COLOR_CSS[color]
  const canAdd = text.trim() && (mode === 'weekly' ? selectedDays.length > 0 : true)

  const toggleDay = (key) => setDays(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key])

  const handleAdd = async () => {
    if (!canAdd || saving) return
    setSaving(true)
    try {
      const base = { text: text.trim(), icon, color, duration: duration || null, reminderTime: reminderTime || null }
      if (isEditMode) {
        if (mode === 'prayer')       await onEdit({ ...base, prayerId })
        else if (mode === 'weekly')  await onEdit({ ...base, days: selectedDays, type: 'weekly' })
        else                         await onEdit({ ...base, date: selectedDate, type: 'daily' })
      } else {
        if (mode === 'prayer')       await onAdd({ ...base, prayerId })
        else if (mode === 'weekly')  await onAdd({ ...base, days: selectedDays, type: 'weekly' })
        else                         await onAdd({ ...base, date: selectedDate, type: 'daily' })
      }
      onClose()
    } finally { setSaving(false) }
  }

  const ICONS = ['📋','🎯','⭐','🏃','📖','🧘','💪','🍽','🌙','✨','🔔','💡']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', borderRadius: 20, border: `1px solid ${c.main}35`, borderTop: `3px solid ${c.main}`, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', direction: isAr ? 'rtl' : 'ltr', boxShadow: `0 25px 60px rgba(0,0,0,0.4)` }}
      > {/* This is a modal, so it can be a glass-card. */}
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', background: `linear-gradient(135deg, ${c.main}08 0%, transparent 100%)`, position: 'sticky', top: 0, zIndex: 1, backdropFilter: 'blur(8px)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: c.main + '20', border: `1px solid ${c.main}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, color: 'var(--primary)' }}>{glyph('sparkle')}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isEditMode ? (isAr ? 'تعديل المهمة' : 'Edit Task') :
               mode === 'prayer' ? (isAr ? 'إضافة مهمة للصلاة' : 'Add Prayer Task') :
               mode === 'weekly' ? (isAr ? 'إضافة مهمة أسبوعية' : 'Add Weekly Task') :
               (isAr ? 'إضافة مهمة يومية' : 'Add Daily Task')}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isEditMode ? (isAr ? 'عدّل تفاصيل المهمة ثم احفظ' : 'Update the task details then save') :
               mode === 'prayer' ? (isAr ? 'اختر وقت الصلاة والمهمة' : 'Choose prayer time and task') :
               mode === 'weekly' ? (isAr ? 'تتكرر كل أسبوع في الأيام المختارة' : 'Repeats weekly on selected days') :
               (isAr ? 'مهمة ليوم محدد' : 'Task for a specific day')}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--v-glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Icon picker */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'أيقونة' : 'Icon'}</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} // Icon picker buttons
                  style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${icon === ic ? c.main : 'var(--border)'}`, background: icon === ic ? c.main + '20' : 'var(--bg-input)', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.15s', transform: icon === ic ? 'scale(1.12)' : 'scale(1)' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'اللون' : 'Color'}</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {COLORS.map(col => (
                <button key={col} type="button" onClick={() => setColor(col)} // Color picker buttons
                  style={{ width: 32, height: 32, borderRadius: '50%', background: COLOR_CSS[col].main, border: 'none', cursor: 'pointer', outline: color === col ? `3px solid ${COLOR_CSS[col].main}` : '3px solid transparent', outlineOffset: 3, transition: 'all 0.18s', transform: color === col ? 'scale(1.2)' : 'scale(1)' }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'عنوان المهمة' : 'Task Title'} <span style={{ color: c.main }}>*</span></label>
            <input value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && canAdd) handleAdd(); if (e.key === 'Escape') onClose() }} // Input field
              placeholder={isAr ? 'مثال: قراءة القرآن الكريم' : 'e.g. Read Quran'} autoFocus
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: `1.5px solid ${text ? c.main + '80' : 'var(--border)'}`, borderRadius: 10, padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', transition: 'border-color 0.2s' }}
            />
          </div>

          {/* Reminder + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{glyph('bell', 11)}{isAr ? 'تذكير' : 'Reminder'}</label>
              <TimePicker12h value={reminderTime} onChange={setReminder} typeColor={c.main} isAr={isAr} />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{glyph('timer', 11)}{isAr ? 'المدة' : 'Duration'}</label>
              <DurationPicker value={duration} onChange={setDuration} typeColor={c.main} isAr={isAr} />
            </div>
          </div>

          {/* Prayer picker */}
          {mode === 'prayer' && (
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{glyph('mosque')} {isAr ? 'وقت الصلاة' : 'Prayer Time'}</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PRAYER_COLS.map(p => {
                  const pc = COLOR_CSS[p.color] // Prayer time buttons
                  const sel = prayerId === p.id
                  return (
                    <button key={p.id} type="button" onClick={() => setPrayerId(p.id)}
                      style={{ flex: 1, minWidth: 72, padding: '0.65rem 0.3rem', borderRadius: 12, border: `2px solid ${sel ? pc.main : 'var(--border)'}`, background: sel ? pc.main + '18' : 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.18s', transform: sel ? 'translateY(-2px)' : 'none', boxShadow: sel ? `0 4px 12px ${pc.main}30` : 'none' }}>
                      <div style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{p.icon}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: sel ? pc.main : 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? p.ar : p.en}</div>
                      {prayerTimes?.[p.id] && <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{fmt12h(prayerTimes[p.id])}</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Weekly day picker */}
          {mode === 'weekly' && (
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {glyph('calendar', 12)} {isAr ? 'الأيام' : 'Days'}
                {selectedDays.length === 0 && <span style={{ fontSize: '0.58rem', color: 'var(--ruby)', background: 'var(--ruby-dim)', padding: '0.06rem 0.45rem', borderRadius: 99, fontWeight: 400 }}>{isAr ? 'اختر يوماً' : 'pick at least 1'}</span>}
                {selectedDays.length > 0 && <span style={{ fontSize: '0.58rem', color: c.main, background: c.main + '18', padding: '0.06rem 0.45rem', borderRadius: 99, fontWeight: 700 }}>{selectedDays.length}</span>} {/* This is a badge, fine. */}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {FULL_DAYS.map(day => {
                  const sel = selectedDays.includes(day.key)
                  return (
                    <button key={day.key} type="button" onClick={() => toggleDay(day.key)}
                      style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: `2px solid ${sel ? c.main : 'var(--border)'}`, background: sel ? c.main : 'var(--bg-input)', color: sel ? 'white' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: sel ? 700 : 400, cursor: 'pointer', transition: 'all 0.18s', transform: sel ? 'scale(1.05)' : 'scale(1)', boxShadow: sel ? `0 3px 10px ${c.main}40` : 'none', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', textAlign: 'center', lineHeight: 1.3 }}>
                      {isAr ? day.ar : day.en}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Daily date picker */}
          {mode === 'daily' && (
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{glyph('calendar', 12)} {isAr ? 'اليوم' : 'Day'}</label>
              <input type="date" value={selectedDate} onChange={e => setDate(e.target.value)} // Input field
                style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: `1.5px solid ${c.main}55`, borderRadius: 10, padding: '0.65rem 1rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          )}

          {/* Live preview */}
          {text.trim() && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '1rem 1.1rem', background: `linear-gradient(135deg, ${c.main}10, ${c.main}06)`, border: `1px solid ${c.main}30`, borderRadius: 12, display: 'flex', gap: '0.875rem', alignItems: 'center' }} // This is a preview card, fine.
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: c.main + '25', border: `1.5px solid ${c.main}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', marginBottom: '0.3rem' }}>{text}</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {reminderTime && <span style={{ fontSize: '0.62rem', color: 'var(--sapphire)', background: 'var(--sapphire-dim)', padding: '0.06rem 0.45rem', borderRadius: 99 }}>{glyph('bell', 11)}{fmt12h(reminderTime)}</span>}
                  {duration > 0 && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.06rem 0.45rem', borderRadius: 99 }}>{glyph('timer', 11)}{fmtDur(duration)}</span>}
                  {mode === 'weekly' && selectedDays.map(dk => { const d = FULL_DAYS.find(x => x.key === dk); return <span key={dk} style={{ fontSize: '0.62rem', color: c.main, background: c.main + '18', padding: '0.06rem 0.45rem', borderRadius: 99, fontWeight: 600, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? d?.ar : d?.en}</span> })}
                  {mode === 'prayer' && (() => { const p = PRAYER_COLS.find(x => x.id === prayerId); const pc = COLOR_CSS[p?.color]; return <span style={{ fontSize: '0.62rem', color: pc?.main, background: pc?.main + '18', padding: '0.06rem 0.45rem', borderRadius: 99, fontWeight: 600 }}>{p?.icon} {isAr ? p?.ar : p?.en}</span> })()}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--v-glass-border)', display: 'flex', gap: '0.75rem', justifyContent: isAr ? 'flex-start' : 'flex-end', background: 'var(--v-glass-bg)', position: 'sticky', bottom: 0 }}>
          <button onClick={onClose} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          <button onClick={handleAdd} disabled={!canAdd || saving}
            style={{ padding: '0.65rem 1.75rem', borderRadius: 10, border: 'none', background: canAdd ? `linear-gradient(135deg, ${c.main}, ${c.main}cc)` : 'var(--bg-input)', color: canAdd ? 'white' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 700, cursor: canAdd ? 'pointer' : 'default', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', opacity: saving ? 0.7 : 1, transition: 'all 0.15s', boxShadow: canAdd ? `0 4px 14px ${c.main}40` : 'none' }}>
            {saving ? (isAr ? 'جارٍ...' : 'Saving...') : isEditMode ? (isAr ? 'حفظ التغييرات' : 'Save Changes') : (isAr ? 'إضافة المهمة' : 'Add Task')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── TaskChip ──────────────────────────────────────────────────────────────────
function TaskChip({ item, isAr, onDelete, onEdit }) {
  const accent = COLOR_CSS[item.color]?.main || 'var(--sapphire)'
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} // This is a small card-like element, fine.
      style={{ background: accent + '10', border: `1px solid ${accent}28`, borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: '0.5rem 0.6rem', marginBottom: '0.45rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
        <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.2 }}>{item.icon || '📋'}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1, lineHeight: 1.4, wordBreak: 'break-word' }}>{item.text}</span>
        {onEdit && <button onClick={() => onEdit(item)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0 0.1rem', flexShrink: 0, lineHeight: 1 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--sapphire)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} title={isAr ? 'تعديل' : 'Edit'}>{glyph('pencil', 12)}</button>}
        <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', padding: '0 0.1rem', flexShrink: 0, lineHeight: 1 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--ruby)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'} title={isAr ? 'حذف' : 'Delete'}>✕</button>
      </div>
      {(item.reminderTime || item.duration > 0) && ( // These are badges, fine.
        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', paddingInlineStart: '1.4rem', flexWrap: 'wrap' }}> 
          {item.reminderTime && <span style={{ fontSize: '0.62rem', color: 'var(--sapphire)', background: 'var(--sapphire-dim)', padding: '0.07rem 0.4rem', borderRadius: 99 }}>{glyph('bell', 11)}{fmt12h(item.reminderTime)}</span>}
          {item.duration > 0 && <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.07rem 0.4rem', borderRadius: 99 }}>{glyph('timer', 11)}{fmtDur(item.duration)}</span>}
        </div>
      )}
    </motion.div>
  )
}

// ── SavedSchedulePreview ──────────────────────────────────────────────────────
function SavedSchedulePreview({ type, items, isAr, language, prayerTimes, date }) {
  const { user } = useAuth()
  if (!items || items.length === 0) return null
  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]

  const toggleItem = async (item) => {
    if (!user) return
    const colName = type === 'prayer' ? 'prayerScheduleItems' : 'customScheduleItems'
    await updateDoc(doc(db, 'users', user.uid, colName, item.id), { completed: !item.completed })
  }

  const ItemRow = ({ item, accent, compact = false }) => {
    const done = !!item.completed
    const c = done ? 'var(--emerald)' : accent
    return (
      <div onClick={() => toggleItem(item)}
        style={{ display: 'flex', alignItems: 'center', gap: compact ? '0.25rem' : '0.35rem', padding: compact ? '0.25rem 0.35rem' : '0.3rem 0.4rem', background: done ? 'rgba(23, 102, 181,0.1)' : c + '10', borderLeft: `2px solid ${c}`, borderRadius: compact ? 6 : 7, marginBottom: compact ? '0.25rem' : '0.3rem', cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ width: compact ? 13 : 15, height: compact ? 13 : 15, borderRadius: 4, flexShrink: 0, background: done ? 'var(--emerald)' : 'transparent', border: `1.5px solid ${done ? 'var(--emerald)' : c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s' }}>
          {done && <span style={{ fontSize: '0.5rem', color: 'white', fontWeight: 700 }}>✓</span>}
        </div>
        {!compact && <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</span>}
        <span style={{ fontSize: compact ? '0.63rem' : '0.72rem', fontWeight: 600, color: done ? 'var(--emerald)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1, flex: 1 }}>{item.text}</span>
        {!compact && !done && item.reminderTime && <span style={{ fontSize: '0.57rem', color: 'var(--mizan-cyan)', flexShrink: 0 }}>{glyph('bell', 11)}{fmt12h(item.reminderTime)}</span>}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{ marginTop: '2rem' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}> {/* This is a section header, fine. */}
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 1rem', borderRadius: 99, background: 'var(--emerald-dim)', border: '1px solid rgba(74,222,128,0.3)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>{glyph('check', 11)}</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--emerald)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'الجدول المحفوظ' : 'Saved Schedule'}</span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>· {isAr ? 'انقر على المهمة لإتمامها' : 'click a task to complete it'}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {type === 'prayer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }} className="prayer-cols-grid">
          {PRAYER_COLS.map(prayer => { // These are cards, apply glass-card. // Each prayer column is a card.
            const pc = COLOR_CSS[prayer.color]
            const colItems = items.filter(i => i.prayerId === prayer.id)
            if (colItems.length === 0) return <div key={prayer.id} style={{ borderRadius: 12, border: '1px dashed var(--border)', padding: '1rem 0.5rem', textAlign: 'center', opacity: 0.35 }}><div style={{ fontSize: '1.1rem' }}>{prayer.icon}</div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? prayer.ar : prayer.en}</div></div>
            const doneCount = colItems.filter(i => i.completed).length
            return (
              <div key={prayer.id} style={{ background: 'var(--bg-card)', borderRadius: 14, border: `1px solid ${pc.main}20`, borderTop: `2px solid ${doneCount === colItems.length ? 'var(--emerald)' : pc.main}`, padding: '0.75rem', transition: 'border-top-color 0.3s' }}>
                <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '1.2rem' }}>{prayer.icon}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: doneCount === colItems.length ? 'var(--emerald)' : pc.main, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? prayer.ar : prayer.en}</div>
                  {(() => { const pt = prayerTimes?.[prayer.id === 'shuruq' ? 'sunrise' : prayer.id]; return pt ? <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{fmt12h(pt)}</div> : null })()}
                  {colItems.length > 0 && <div style={{ fontSize: '0.58rem', color: doneCount === colItems.length ? 'var(--emerald)' : 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>{doneCount}/{colItems.length}</div>}
                </div>
                {colItems.map(item => <ItemRow key={item.id} item={item} accent={pc.main} />)}
              </div>
            )
          })}
        </div>
      )}

      {type === 'custom-weekly' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.6rem' }} className="week-cols-grid">
          {FULL_DAYS.map(day => { // These are cards, apply glass-card. // Each day column is a card.
            const colItems = items.filter(i => (i.days || []).includes(day.key))
            const isToday = day.key === todayKey
            if (colItems.length === 0) return <div key={day.key} style={{ borderRadius: 10, border: '1px dashed var(--border)', padding: '0.6rem 0.4rem', opacity: 0.35, textAlign: 'center' }}><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', wordBreak: 'break-word' }}>{isAr ? day.ar : day.en}</div></div>
            const doneCount = colItems.filter(i => i.completed).length
            const allDone = doneCount === colItems.length
            return (
              <div key={day.key} style={{ background: isToday ? 'rgba(99,179,237,0.06)' : 'var(--bg-card)', borderRadius: 10, border: isToday ? '1px solid rgba(99,179,237,0.3)' : '1px solid var(--border)', padding: '0.6rem 0.5rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: allDone ? 'var(--emerald)' : isToday ? 'var(--sapphire)' : 'var(--text-primary)', textAlign: 'center', marginBottom: '0.15rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', wordBreak: 'break-word' }}>{isAr ? day.ar : day.en}</div>
                <div style={{ fontSize: '0.55rem', color: allDone ? 'var(--emerald)' : 'var(--text-muted)', textAlign: 'center', marginBottom: '0.35rem', fontWeight: 600 }}>{doneCount}/{colItems.length}</div>
                {colItems.map(item => {
                  const accent = COLOR_CSS[item.color]?.main || 'var(--sapphire)'
                  return <ItemRow key={item.id} item={item} accent={accent} compact />
                })}
              </div>
            )
          })}
        </div>
      )}

      {type === 'custom-daily' && (
        <div className="glass-card" style={{ maxWidth: 560, margin: '0 auto', borderRadius: '16px', border: '1px solid rgba(23, 102, 181,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem' }}>{glyph('calendarDays', 13)}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1 }}>
              {date && new Date(date + 'T00:00:00').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{items.filter(i => i.completed).length}/{items.length}</span>
          </div>
          {items.map(item => {
            const done = !!item.completed
            const accent = COLOR_CSS[item.color]?.main || 'var(--emerald)'
            const c = done ? 'var(--emerald)' : accent
            return (
              <div key={item.id} onClick={() => toggleItem(item)} // This is a task item, fine.
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)', background: done ? 'rgba(74,222,128,0.06)' : 'transparent', cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: done ? 'var(--emerald)' : 'transparent', border: `2px solid ${done ? 'var(--emerald)' : c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {done && <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: done ? 'var(--emerald)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flex: 1, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.75 : 1 }}>{item.text}</span>
                {!done && item.reminderTime && <span style={{ fontSize: '0.6rem', color: 'var(--sapphire)', flexShrink: 0 }}>{glyph('bell', 11)}{fmt12h(item.reminderTime)}</span>}
                {!done && item.duration > 0 && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>{glyph('timer', 11)}{fmtDur(item.duration)}</span>}
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ── PrayerScheduleView ────────────────────────────────────────────────────────
function PrayerScheduleView({ isAr, language, prayerTimes, onBack }) {
  const { user } = useAuth()
  const [items,    setItems]    = useState([])
  const [saved,    setSaved]    = useState(false)
  const [modal,    setModal]    = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub1 = onSnapshot(collection(db, 'users', user.uid, 'prayerScheduleItems'),
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0))))
    const unsub2 = onSnapshot(doc(db, 'users', user.uid, 'savedSchedules', 'prayer'),
      snap => setSaved(snap.exists() ? !!snap.data()?.saved : false))
    return () => { unsub1(); unsub2() }
  }, [user])

  const addItem = async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'prayerScheduleItems'), { ...data, order: Date.now(), createdAt: new Date().toISOString() })
  }

  const deleteItem = async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'prayerScheduleItems', id))
  }

  const updateItem = async (id, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'prayerScheduleItems', id), data)
  }

  const saveSchedule = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid, 'savedSchedules', 'prayer'), { saved: true, savedAt: new Date().toISOString(), type: 'prayer' })
    } finally { setSaving(false) }
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mizan-purple)'; e.currentTarget.style.color = 'var(--mizan-purple)' }} // Mizan purple
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--v-glass-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          {isAr ? '›' : '‹'}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--gold)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', margin: 0 }}>{glyph('mosque')} {isAr ? 'الجدول الديني' : 'Prayer Schedule'}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'أضف مهامك لكل وقت صلاة' : 'Add tasks to each prayer time'}</p>
        </div>
        {items.length > 0 && (
          <button onClick={saveSchedule} disabled={saving}
            style={{ padding: '0.65rem 1.4rem', borderRadius: 12, border: 'none', background: saved ? 'var(--emerald-dim)' : 'linear-gradient(135deg, var(--gold), #b8860b)', color: saved ? 'var(--emerald)' : 'var(--bg-base)', fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer', transition: 'all 0.2s', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.45rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', boxShadow: saved ? 'none' : '0 4px 14px rgba(212,175,106,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {saving ? '...' : saved ? (isAr ? '✓ محفوظ' : '✓ Saved') : (isAr ? 'حفظ الجدول' : 'Save Schedule')}
          </button>
        )}
      </div>

      {/* 5-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.875rem', marginBottom: '2rem' }} className="prayer-cols-grid">
        {PRAYER_COLS.map(prayer => {
          const pc = COLOR_CSS[prayer.color] // These are cards, apply glass-card. // Each prayer column is a card.
          const colItems = items.filter(i => i.prayerId === prayer.id)
          const pt = prayerTimes?.[prayer.id === 'shuruq' ? 'sunrise' : prayer.id]
          return (
            <div key={prayer.id}
              style={{ background: 'var(--bg-card)', borderRadius: 16, border: `1px solid ${pc.main}25`, borderTop: `3px solid ${pc.main}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 260, boxShadow: `0 4px 16px ${pc.main}0a` }}>
              {/* Column header */}
              <div style={{ padding: '0.875rem 0.75rem', borderBottom: `1px solid ${pc.main}18`, background: `linear-gradient(180deg, ${pc.main}10 0%, transparent 100%)` }}>
                <div style={{ fontSize: '1.6rem', textAlign: 'center', marginBottom: '0.25rem' }}>{prayer.icon}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: pc.main, textAlign: 'center', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? prayer.ar : prayer.en}</div>
                {pt && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.18rem' }}>{fmt12h(pt)}</div>}
                {colItems.length > 0 && <div style={{ fontSize: '0.58rem', color: pc.main, background: pc.main + '18', borderRadius: 99, padding: '0.04rem 0.4rem', textAlign: 'center', marginTop: '0.3rem', fontWeight: 600, display: 'inline-block', width: '100%' }}>{colItems.length}</div>}
              </div>
              {/* Tasks */}
              <div style={{ flex: 1, padding: '0.6rem', overflowY: 'auto' }}> {/* Task list */}
                <AnimatePresence>
                  {colItems.map(item => <TaskChip key={item.id} item={item} isAr={isAr} onDelete={deleteItem} onEdit={setEditItem} />)}
                </AnimatePresence>
                {colItems.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textAlign: 'center', padding: '1rem 0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', opacity: 0.5 }}>{isAr ? 'لا توجد مهام' : 'No tasks yet'}</div>
                )}
              </div>
              {/* Add button */}
              <div style={{ padding: '0.5rem 0.6rem', borderTop: `1px solid ${pc.main}12` }}> {/* Add button container */}
                <button onClick={() => setModal(prayer.id)} // This is a button, fine.
                  style={{ width: '100%', padding: '0.45rem', borderRadius: 8, border: `1.5px dashed ${pc.main}50`, background: pc.main + '08', color: pc.main, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.background = pc.main + '1a'; e.currentTarget.style.borderStyle = 'solid' }}
                  onMouseLeave={e => { e.currentTarget.style.background = pc.main + '08'; e.currentTarget.style.borderStyle = 'dashed' }}>
                  + {isAr ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Saved preview */}
      <AnimatePresence>
        {saved && <SavedSchedulePreview type="prayer" items={items} isAr={isAr} language={language} prayerTimes={prayerTimes} />}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {modal && (
          <AddScheduleTaskModal
            mode="prayer"
            onAdd={async (data) => { await addItem({ ...data, prayerId: modal }) }}
            onClose={() => setModal(null)}
            isAr={isAr}
            prayerTimes={prayerTimes}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <AddScheduleTaskModal
            mode="prayer"
            editItem={editItem}
            onEdit={async (data) => { await updateItem(editItem.id, data) }}
            onClose={() => setEditItem(null)}
            isAr={isAr}
            prayerTimes={prayerTimes}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) { .prayer-cols-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 520px) { .prayer-cols-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 340px) { .prayer-cols-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}

// ── WeeklyCustomView ──────────────────────────────────────────────────────────
function WeeklyCustomView({ isAr, language, onBack }) {
  const { user } = useAuth()
  const [items,    setItems]    = useState([])
  const [saved,    setSaved]    = useState(false)
  const [modal,    setModal]    = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    if (!user) return
    const unsub1 = onSnapshot(collection(db, 'users', user.uid, 'customScheduleItems'),
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.type === 'weekly').sort((a, b) => (a.order || 0) - (b.order || 0))))
    const unsub2 = onSnapshot(doc(db, 'users', user.uid, 'savedSchedules', 'custom'),
      snap => setSaved(snap.exists() && snap.data()?.saved && snap.data()?.type === 'weekly'))
    return () => { unsub1(); unsub2() }
  }, [user])

  const addItem = async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'customScheduleItems'), { ...data, order: Date.now(), createdAt: new Date().toISOString() })
  }

  const deleteItem = async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'customScheduleItems', id))
  }

  const updateItem = async (id, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'customScheduleItems', id), data)
  }

  const saveSchedule = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid, 'savedSchedules', 'custom'), { saved: true, type: 'weekly', savedAt: new Date().toISOString() })
    } finally { setSaving(false) }
  }

  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mizan-cyan)'; e.currentTarget.style.color = 'var(--mizan-cyan)' }} // Mizan cyan
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--v-glass-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          {isAr ? '›' : '‹'}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--sapphire)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', margin: 0 }}>{glyph('calendar')} {isAr ? 'الجدول الأسبوعي' : 'Weekly Schedule'}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'نظّم مهامك عبر أيام الأسبوع' : 'Organize tasks across the week'}</p>
        </div>
        {items.length > 0 && (
          <button onClick={saveSchedule} disabled={saving}
            style={{ padding: '0.65rem 1.4rem', borderRadius: 12, border: 'none', background: saved ? 'var(--emerald-dim)' : 'linear-gradient(135deg, var(--sapphire), #2563eb)', color: saved ? 'var(--emerald)' : 'white', fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer', transition: 'all 0.2s', opacity: saving ? 0.7 : 1, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', boxShadow: saved ? 'none' : '0 4px 14px rgba(99,179,237,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {saving ? '...' : saved ? (isAr ? '✓ محفوظ' : '✓ Saved') : (isAr ? 'حفظ الجدول' : 'Save Schedule')}
          </button>
        )}
      </div>

      {/* 7-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', marginBottom: '2rem' }} className="week-cols-grid">
        {FULL_DAYS.map(day => {
          const isToday = day.key === todayKey // These are cards, apply glass-card. // Each day column is a card.
          const colItems = items.filter(i => (i.days || []).includes(day.key))
          return (
            <div key={day.key}
              style={{ background: isToday ? 'linear-gradient(180deg, rgba(99,179,237,0.08) 0%, var(--bg-card) 100%)' : 'var(--bg-card)', borderRadius: 16, border: isToday ? '1px solid rgba(99,179,237,0.35)' : '1px solid var(--border)', borderTop: isToday ? '3px solid var(--sapphire)' : '3px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 220 }}>
              {/* Day header */}
              <div style={{ padding: '0.75rem 0.6rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isToday ? 'var(--sapphire)' : 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', lineHeight: 1.2, marginBottom: '0.15rem' }}>{isAr ? day.ar : day.en}</div>
                {isToday && <div style={{ fontSize: '0.56rem', color: 'var(--sapphire)', background: 'rgba(99,179,237,0.15)', borderRadius: 99, padding: '0.04rem 0.35rem', display: 'inline-block', fontWeight: 600 }}>{isAr ? 'اليوم' : 'Today'}</div>}
                {colItems.length > 0 && <div style={{ fontSize: '0.58rem', color: isToday ? 'var(--sapphire)' : 'var(--text-muted)', marginTop: '0.1rem', fontWeight: 600 }}>{colItems.length}</div>}
              </div>
              {/* Tasks */}
              <div style={{ flex: 1, padding: '0.5rem', overflowY: 'auto' }}>
                <AnimatePresence>
                  {colItems.map(item => <TaskChip key={item.id + day.key} item={item} isAr={isAr} onDelete={deleteItem} onEdit={setEditItem} />)}
                </AnimatePresence>
              </div>
              {/* Add button */}
              <div style={{ padding: '0.4rem 0.5rem', borderTop: '1px solid var(--border)' }}> {/* Add button container */}
                <button onClick={() => setModal(day.key)} // This is a button, fine.
                  style={{ width: '100%', padding: '0.4rem', borderRadius: 8, border: '1.5px dashed var(--border-strong)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sapphire)'; e.currentTarget.style.color = 'var(--sapphire)'; e.currentTarget.style.background = 'rgba(99,179,237,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                  + {isAr ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {saved && <SavedSchedulePreview type="custom-weekly" items={items} isAr={isAr} language={language} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <AddScheduleTaskModal mode="weekly" defaultDay={modal} onAdd={addItem} onClose={() => setModal(null)} isAr={isAr} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editItem && (
          <AddScheduleTaskModal
            mode="weekly"
            editItem={editItem}
            onEdit={async (data) => { await updateItem(editItem.id, data) }}
            onClose={() => setEditItem(null)}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) { .week-cols-grid { grid-template-columns: repeat(4, 1fr) !important; } }
        @media (max-width: 600px) { .week-cols-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}

// ── DailyCustomView ───────────────────────────────────────────────────────────
function DailyCustomView({ isAr, language, onBack }) {
  const { user } = useAuth()
  const [items,    setItems]    = useState([])
  const [saved,    setSaved]    = useState(false)
  const [modal,    setModal]    = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [selDate,  setSelDate]  = useState(localDateStr())

  useEffect(() => {
    if (!user) return
    const unsub1 = onSnapshot(collection(db, 'users', user.uid, 'customScheduleItems'),
      snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.type === 'daily').sort((a, b) => (a.order || 0) - (b.order || 0))))
    const unsub2 = onSnapshot(doc(db, 'users', user.uid, 'savedSchedules', 'custom'),
      snap => setSaved(snap.exists() && snap.data()?.saved && snap.data()?.type === 'daily'))
    return () => { unsub1(); unsub2() }
  }, [user])

  const dayItems = items.filter(i => i.date === selDate)

  const addItem = async (data) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'customScheduleItems'), { ...data, order: Date.now(), createdAt: new Date().toISOString() })
  }

  const deleteItem = async (id) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'customScheduleItems', id))
  }

  const updateItem = async (id, data) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid, 'customScheduleItems', id), data)
  }

  const saveSchedule = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user.uid, 'savedSchedules', 'custom'), { saved: true, type: 'daily', date: selDate, savedAt: new Date().toISOString() })
    } finally { setSaving(false) }
  }

  const dateLabel = new Date(selDate + 'T00:00:00').toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mizan-cyan)'; e.currentTarget.style.color = 'var(--mizan-cyan)' }} // Mizan cyan
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--v-glass-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          {isAr ? '›' : '‹'}
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--emerald)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', margin: 0 }}>{glyph('calendarDays')} {isAr ? 'الجدول اليومي' : 'Daily Schedule'}</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{dateLabel}</p>
        </div>
        <input type="date" value={selDate} onChange={e => setSelDate(e.target.value)}
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.45rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}
        /> {/* Input field */}
        {dayItems.length > 0 && (
          <button onClick={saveSchedule} disabled={saving}
            style={{ padding: '0.65rem 1.4rem', borderRadius: 12, border: 'none', background: saved ? 'var(--emerald-dim)' : 'linear-gradient(135deg, var(--emerald), #059669)', color: saved ? 'var(--emerald)' : 'white', fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer', transition: 'all 0.2s', opacity: saving ? 0.7 : 1, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', boxShadow: saved ? 'none' : '0 4px 14px rgba(74,222,128,0.35)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {saving ? '...' : saved ? (isAr ? '✓ محفوظ' : '✓ Saved') : (isAr ? 'حفظ الجدول' : 'Save Schedule')}
          </button>
        )}
      </div>

      {/* Single column */}
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="glass-card" style={{ borderRadius: '18px', border: '1px solid rgba(23, 102, 181,0.25)', borderTop: '3px solid var(--emerald)', overflow: 'hidden', boxShadow: '0 6px 24px rgba(23, 102, 181,0.08)' }}> // Mizan cyan
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(74,222,128,0.12)', background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, transparent 100%)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, color: 'var(--emerald)' }}>{glyph('calendarDays')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--emerald)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{dateLabel}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.08rem' }}>{dayItems.length} {isAr ? 'مهام' : dayItems.length === 1 ? 'task' : 'tasks'}</div>
            </div>
            <button onClick={() => setModal(true)}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--emerald), #059669)', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', boxShadow: '0 3px 10px rgba(74,222,128,0.35)', flexShrink: 0 }}>
              + {isAr ? 'إضافة مهمة' : 'Add Task'}
            </button>
          </div>
          <div style={{ padding: '0.875rem 1rem', minHeight: 120 }}>
            <AnimatePresence>
              {dayItems.map(item => <TaskChip key={item.id} item={item} isAr={isAr} onDelete={deleteItem} onEdit={setEditItem} />)} {/* TaskChip is already handled. // Keep TaskChip */}
            </AnimatePresence>
            {dayItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>{glyph('clipboard')}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{isAr ? 'لا توجد مهام لهذا اليوم' : 'No tasks for this day'}</div>
                <div style={{ fontSize: '0.72rem', marginTop: '0.35rem', opacity: 0.7 }}>{isAr ? 'اضغط + إضافة مهمة للبدء' : 'Click + Add Task to get started'}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {saved && <SavedSchedulePreview type="custom-daily" items={dayItems} isAr={isAr} language={language} date={selDate} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal && (
          <AddScheduleTaskModal mode="daily" defaultDate={selDate} onAdd={addItem} onClose={() => setModal(false)} isAr={isAr} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editItem && (
          <AddScheduleTaskModal
            mode="daily"
            editItem={editItem}
            onEdit={async (data) => { await updateItem(editItem.id, data) }}
            onClose={() => setEditItem(null)}
            isAr={isAr}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── ScheduleTab ───────────────────────────────────────────────────────────────
const DAY_KEYS_SCHED = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function ScheduleTab({ isAr, language }) {
  const { prayerTimes } = useApp()
  const [view,       setView]       = useState(null) // null | 'custom' | 'prayer'
  const [customMode, setCustomMode] = useState(null) // null | 'weekly' | 'daily'

  if (view === 'prayer') return (
    <AnimatePresence mode="wait">
      <motion.div key="prayer-view" initial={{ opacity: 0, x: isAr ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
        <PrayerScheduleView isAr={isAr} language={language} prayerTimes={prayerTimes} onBack={() => setView(null)} />
      </motion.div>
    </AnimatePresence>
  )

  if (view === 'custom' && customMode === 'weekly') return (
    <AnimatePresence mode="wait">
      <motion.div key="weekly-view" initial={{ opacity: 0, x: isAr ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
        <WeeklyCustomView isAr={isAr} language={language} onBack={() => setCustomMode(null)} />
      </motion.div>
    </AnimatePresence>
  )

  if (view === 'custom' && customMode === 'daily') return (
    <AnimatePresence mode="wait">
      <motion.div key="daily-view" initial={{ opacity: 0, x: isAr ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
        <DailyCustomView isAr={isAr} language={language} onBack={() => setCustomMode(null)} />
      </motion.div>
    </AnimatePresence>
  )

  if (view === 'custom') return (
    <AnimatePresence mode="wait">
      <motion.div key="custom-type" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <button onClick={() => setView(null)}
            style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--v-glass-border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sapphire)'; e.currentTarget.style.color = 'var(--sapphire)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            {isAr ? '›' : '‹'}
          </button>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--sapphire)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', margin: 0 }}>{glyph('calendar')} {isAr ? 'الجدول المخصص' : 'Custom Schedule'}</h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{isAr ? 'اختر نوع الجدول' : 'Choose schedule type'}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: 620, margin: '0 auto' }}>
          {[ // These are buttons, apply glass-card.
            { mode: 'weekly', icon: glyph('calendar'), title: isAr ? 'أسبوعي' : 'Weekly', desc: isAr ? 'جدول يتكرر كل أسبوع عبر الأيام السبعة' : 'Recurring across all 7 days of the week', color: 'var(--sapphire)', dim: 'var(--sapphire-dim)', glow: 'rgba(99,179,237,0.35)' },
            { mode: 'daily',  icon: glyph('calendarDays'), title: isAr ? 'يومي'   : 'Daily',  desc: isAr ? 'جدول مخصص لتنظيم يوم محدد فقط'       : 'Focused plan for a single specific day',    color: 'var(--emerald)',  dim: 'var(--emerald-dim)',  glow: 'rgba(74,222,128,0.35)' },
          ].map(opt => (
            <motion.button key={opt.mode} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => setCustomMode(opt.mode)}
              style={{ padding: '2rem 1.5rem', borderRadius: 18, border: `1.5px solid ${opt.color}35`, background: `linear-gradient(135deg, ${opt.dim} 0%, var(--bg-card) 100%)`, cursor: 'pointer', textAlign: isAr ? 'right' : 'left', boxShadow: `0 4px 20px ${opt.color}10`, direction: isAr ? 'rtl' : 'ltr', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 30px ${opt.glow}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 20px ${opt.color}10`}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: opt.color, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', marginBottom: '0.4rem' }}>{opt.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', lineHeight: 1.6 }}>{opt.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div> // Keep motion div
    </AnimatePresence>
  )

  // ── Main entry: two big buttons ────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div key="selector" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>{glyph('clipboard')}</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', margin: '0 0 0.5rem' }}>
            {isAr ? 'إنشاء جدول' : 'Create a Schedule'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', maxWidth: 420, margin: '0 auto' }}>
            {isAr ? 'اختر نوع الجدول الذي تريد إنشاءه' : "Choose the kind of schedule you'd like to build"}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 760, margin: '0 auto' }} className="schedule-type-grid">
          {[
            {
              id: 'custom', icon: glyph('calendar'), badge: glyph('sparkle'),
              title: isAr ? 'جدول مخصص' : 'Custom Schedule',
              desc: isAr ? 'أنشئ جدولاً يومياً أو أسبوعياً يناسب حياتك اليومية وأهدافك الشخصية' : 'Build a personalized daily or weekly plan tailored to your goals and routines',
              color: 'var(--sapphire)', dim: 'rgba(99,179,237,0.1)', border: 'rgba(99,179,237,0.28)', glow: 'rgba(99,179,237,0.35)',
              tags: isAr ? ['أسبوعي', 'يومي', 'مهام', 'تذكيرات'] : ['Weekly', 'Daily', 'Tasks', 'Reminders'],
            },
            {
              id: 'prayer', icon: glyph('mosque'), badge: glyph('sparkle'), // Each option is a button.
              title: isAr ? 'جدول الصلوات' : 'Prayer Schedule',
              desc: isAr ? 'خطط مهامك حول أوقات الصلوات الخمس لحياة منظمة وروحانية متوازنة' : 'Organize tasks around the five daily prayers for a balanced, mindful life',
              color: 'var(--gold)', dim: 'rgba(212,175,106,0.1)', border: 'rgba(212,175,106,0.28)', glow: 'rgba(212,175,106,0.4)',
              tags: isAr ? ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'] : ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
            },
          ].map(opt => (
            <motion.button key={opt.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => setView(opt.id)} // These are buttons, apply glass-card. // Keep onClick
              style={{ padding: '2.25rem 2rem', borderRadius: 22, border: `1.5px solid ${opt.border}`, background: `linear-gradient(145deg, ${opt.dim} 0%, var(--bg-card) 60%)`, cursor: 'pointer', textAlign: isAr ? 'right' : 'left', transition: 'box-shadow 0.25s', boxShadow: `0 6px 24px ${opt.color}10`, direction: isAr ? 'rtl' : 'ltr', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 14px 44px ${opt.glow}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 6px 24px ${opt.color}10`}
            >
              <div style={{ position: 'absolute', top: 12, [isAr ? 'left' : 'right']: 18, fontSize: '3.5rem', opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>{opt.badge}</div>
              <div style={{ fontSize: '2.8rem', marginBottom: '1rem', lineHeight: 1 }}>{opt.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '1.22rem', color: opt.color, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', marginBottom: '0.6rem', lineHeight: 1.2 }}>{opt.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', lineHeight: 1.7, marginBottom: '1.25rem' }}>{opt.desc}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {opt.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.63rem', fontWeight: 600, color: opt.color, background: opt.color + '18', padding: '0.15rem 0.55rem', borderRadius: 99, border: `1px solid ${opt.color}22`, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{tag}</span>
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: 18, [isAr ? 'left' : 'right']: 18, width: 30, height: 30, borderRadius: 8, background: opt.color + '20', border: `1px solid ${opt.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: opt.color }}>
                {isAr ? '‹' : '›'}
              </div>
            </motion.button>
          ))}
        </div>
        {/* Schedule type grid */}
        <style>{`@media (max-width: 600px) { .schedule-type-grid { grid-template-columns: 1fr !important; } }`}</style>
      </motion.div>
    </AnimatePresence>
  )
}

// ── PlannerPage ───────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const { goals, gamification, addGoal, deleteGoal, addMilestone, deleteMilestone, toggleMilestone } = useApp()
  const { language } = useI18n()
  const isAr = language === 'ar'

  const [activeTab,   setActiveTab]   = useState('goals')
  const [filter,      setFilter]      = useState('all')
  const [toast,       setToast]       = useState(null)
  const [showAddGoal, setShowAddGoal] = useState(false)

  // Filter + sort
  const today = todayStr()
  const filteredGoals = sortGoals(goals).filter(g => {
    const done = isGoalDone(g)
    const overdue = g.deadline && g.deadline < today && !done
    if (filter === 'done')    return done
    if (filter === 'overdue') return overdue
    if (filter === 'active')  return !done && !overdue
    return true
  })

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const handleToggle = async (goalId, milestoneId, currentMilestones) => {
    const wasDone = currentMilestones.find(m => m.id === milestoneId)?.completed
    if (wasDone) { await toggleMilestone(goalId, milestoneId); return }

    const result = await toggleMilestone(goalId, milestoneId)
    if (!result) return
    const { xpGain, allDone, newBadges, leveledUp, newLevel } = result

    if (allDone) {
      showToast({ icon: glyph('party'), title: isAr ? 'أكملت هدفاً!' : 'Goal Complete!', sub: `+${xpGain} XP` })
    } else if (newBadges.length > 0) {
      const bd = BADGES_DEF.find(b => b.id === newBadges[0])
      if (bd) showToast({ icon: bd.icon, title: `${isAr ? bd.ar : bd.en} ${isAr ? 'مفتوح!' : 'Unlocked!'}`, sub: `+${xpGain} XP` })
    } else if (leveledUp) {
      showToast({ icon: glyph('levelup'), title: isAr ? `وصلت للمستوى ${newLevel}!` : `Level ${newLevel}!`, sub: isAr ? 'تهانينا!' : 'Congratulations!' })
    } else {
      showToast({ icon: '✓', title: `+${xpGain} XP`, sub: isAr ? 'أحسنت!' : 'Nice work!' })
    }
  }

  const handleAddGoal = async (data) => {
    await addGoal(data)
    setShowAddGoal(false)
  }

  const filterLabel = { all: isAr ? 'الكل' : 'All', active: isAr ? 'نشطة' : 'Active', overdue: isAr ? 'متأخرة' : 'Overdue', done: isAr ? 'مكتملة' : 'Done' }

  // Count per filter for badges
  const counts = {
    all: goals.length,
    active: goals.filter(g => !isGoalDone(g) && !(g.deadline && g.deadline < today)).length,
    overdue: goals.filter(g => g.deadline && g.deadline < today && !isGoalDone(g)).length,
    done: goals.filter(isGoalDone).length,
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, direction: isAr ? 'rtl' : 'ltr' }} className="planner-padding">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--mizan-gradient)', boxShadow: '0 0 10px var(--accent-purple-glow)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {isAr ? 'المخطط' : 'Planner'}
              </span>
            </div>
            <h1 className="gradient-text" style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)', fontSize: isAr ? '2rem' : '2.25rem', fontWeight: 600, marginBottom: '0.35rem', display: 'inline-block' }}>
              {isAr ? 'مخطط الأهداف' : 'Goal Planner'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'حقق أهدافك الكبيرة خطوة بخطوة واكسب النقاط' : 'Break big goals into milestones — earn XP as you go'}
            </p>
          </div>
          <motion.button onClick={() => setShowAddGoal(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', background: 'var(--mizan-gradient)', color: '#ffffff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', whiteSpace: 'nowrap', boxShadow: '0 8px 20px rgba(29, 127, 226,0.3)' }}
          >
            {isAr ? '+ هدف جديد' : '+ New Goal'}
          </motion.button>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'goals',    label: isAr ? 'الأهداف'   : 'Goals',    icon: glyph('target') },
          { id: 'schedule', label: isAr ? 'الجدول'   : 'Schedule', icon: glyph('calendar') },
        ].map(tab => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.55rem 1.25rem', borderRadius: '9999px',
                border: `1px solid ${active ? 'var(--mizan-purple)' : 'var(--v-glass-border)'}`,
                background: active ? 'rgba(29, 127, 226,0.1)' : 'transparent', // Mizan purple background
                color: active ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all var(--transition)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          )
        })}
      </div>

      {/* XP bar — Goals tab only */}
      {activeTab === 'goals' && <XPBar gamification={gamification} isAr={isAr} />}

      {/* Schedule tab */}
      {activeTab === 'schedule' && <ScheduleTab isAr={isAr} language={language} />}

      {/* Filter tabs (Goals tab only) */}
      {activeTab === 'goals' && <>
      {/* Filter tabs */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
      >
        {FILTERS.map(f => {
          const active = filter === f
          const isOverdue = f === 'overdue' && counts.overdue > 0
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
                border: `1px solid ${active ? (isOverdue ? 'var(--mizan-cyan)' : 'var(--mizan-purple)') : 'var(--v-glass-border)'}`,
                background: active ? (isOverdue ? 'rgba(23, 102, 181,0.1)' : 'rgba(29, 127, 226,0.1)') : 'transparent',
                color: active ? (isOverdue ? 'var(--mizan-cyan)' : 'var(--mizan-purple)') : 'var(--text-muted)',
                fontSize: '0.82rem', fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all var(--transition)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {filterLabel[f]}
              {counts[f] > 0 && (
                <span style={{ fontSize: '0.68rem', background: active ? 'rgba(0,0,0,0.15)' : 'var(--bg-input)', padding: '0.05rem 0.45rem', borderRadius: 99 }}>
                  {counts[f]}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Goal cards */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}
        className="planner-grid"
      >
        <AnimatePresence>
          {filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} isAr={isAr}
              onToggle={handleToggle} onAddMilestone={addMilestone}
              onDeleteMilestone={deleteMilestone} onDelete={deleteGoal}
            />
          ))}
        </AnimatePresence>

        {filteredGoals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
              {filter === 'overdue' ? glyph('check', 28) : filter === 'done' ? glyph('trophy', 28) : glyph('target', 28)}
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {filter === 'overdue' ? (isAr ? 'لا توجد أهداف متأخرة' : 'No overdue goals')
                : filter === 'done' ? (isAr ? 'لا توجد أهداف مكتملة بعد' : 'No completed goals yet')
                : filter === 'active' ? (isAr ? 'لا توجد أهداف نشطة' : 'No active goals')
                : (isAr ? 'لا توجد أهداف بعد' : 'No goals yet')}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {filter === 'all' && (isAr ? 'أضف هدفك الأول وقسّمه إلى مهام صغيرة' : 'Add your first goal and break it into milestones')}
            </div>
            {filter === 'all' && (
              <button onClick={() => setShowAddGoal(true)}
                style={{ padding: '0.7rem 1.75rem', borderRadius: '10px', border: '1px solid rgba(29, 127, 226,0.3)', background: 'rgba(29, 127, 226,0.1)', color: 'var(--mizan-purple)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', transition: 'all var(--transition)' }} // Mizan purple button
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(29, 127, 226,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(29, 127, 226,0.1)'}
              >
                {isAr ? '+ إضافة هدف' : '+ Add Your First Goal'}
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Badges legend */}
      {(gamification.badges || []).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card"
          style={{ marginTop: '2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}
        >
          <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'شاراتك' : 'Your Badges'}
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {BADGES_DEF.map(b => {
              const earned = (gamification.badges || []).includes(b.id)
              return (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', borderRadius: '10px', border: `1px solid ${earned ? 'var(--mizan-purple)' : 'var(--v-glass-border)'}`, background: earned ? 'rgba(29, 127, 226,0.1)' : 'var(--bg-input)', opacity: earned ? 1 : 0.4, transition: 'all 0.3s' }}>
                  <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: earned ? 600 : 400, color: earned ? 'var(--gold)' : 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {isAr ? b.ar : b.en}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      </>}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && <AddGoalModal onClose={() => setShowAddGoal(false)} onAdd={handleAddGoal} isAr={isAr} />}
      </AnimatePresence>

      {/* Achievement Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div key="toast"
            initial={{ opacity: 0, y: 64, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 64, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }} // This is a toast, fine.
            style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--gold)', borderRadius: 'var(--radius-lg)', padding: '0.9rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem', boxShadow: '0 8px 32px rgba(29, 127, 226,0.35)', zIndex: 999, minWidth: 240, maxWidth: 360, direction: isAr ? 'rtl' : 'ltr', pointerEvents: 'none' }}
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.4 }} style={{ fontSize: '1.85rem', flexShrink: 0 }}>
              {toast.icon}
            </motion.span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{toast.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '0.1rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{toast.sub}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 600px) {
          .planner-padding { padding: 1rem !important; }
          .planner-grid { grid-template-columns: 1fr !important; }
        }
        div:hover .ms-del { opacity: 0.5 !important; }
        .ms-del { opacity: 0 !important; }
      `}</style>
    </div>
  )
}
