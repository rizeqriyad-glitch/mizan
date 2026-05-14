import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = ['gold', 'emerald', 'sapphire', 'ruby']
const COLOR_CSS = {
  gold:     { main: 'var(--gold)',     dim: 'var(--gold-dim)' },
  emerald:  { main: 'var(--emerald)',  dim: 'var(--emerald-dim)' },
  sapphire: { main: 'var(--sapphire)', dim: 'var(--sapphire-dim)' },
  ruby:     { main: 'var(--ruby)',     dim: 'var(--ruby-dim)' },
}

const BADGES_DEF = [
  { id: 'first_step',   icon: '🎯', en: 'First Step',   ar: 'الخطوة الأولى' },
  { id: 'goal_crusher', icon: '🏆', en: 'Goal Crusher', ar: 'محطم الأهداف' },
  { id: 'week_warrior', icon: '⚔️', en: 'Week Warrior', ar: 'محارب الأسبوع' },
  { id: 'overachiever', icon: '🚀', en: 'Overachiever', ar: 'المتفوق' },
]

const THRESHOLDS = [0.25, 0.5, 0.75, 1.0]
const THRESHOLD_ICON = { 0.25: '🌱', 0.5: '🔥', 0.75: '⚡', 1.0: '🏆' }

// ── Helpers ───────────────────────────────────────────────────────────────────
function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

function formatWeekRange(start, language) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  if (language === 'ar') {
    const s = start.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
    const e = end.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${s} – ${e}`
  }
  const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const e = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

function getLevel(totalXP = 0) {
  const level = Math.floor(totalXP / 100) + 1
  const xpInLevel = totalXP % 100
  return { level, xpInLevel, xpToNext: 100 - xpInLevel, pct: xpInLevel }
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
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Level badge */}
      <div style={{
        width: 52, height: 52,
        borderRadius: '50%',
        background: 'var(--gold-dim)',
        border: '2px solid var(--gold)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.55rem', color: 'var(--gold)', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.04em' }}>
          {isAr ? 'مستوى' : 'LEVEL'}
        </span>
        <span style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>
          {level}
        </span>
      </div>

      {/* XP bar */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {gamification.totalXP || 0} XP
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {xpToNext} {isAr ? 'للمستوى التالي' : 'to next level'}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
              borderRadius: 99,
              minWidth: pct > 0 ? 6 : 0,
            }}
          />
        </div>
      </div>

      {/* Streak */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.4rem 0.875rem',
        background: streak > 0 ? 'rgba(251,146,60,0.1)' : 'var(--bg-input)',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${streak > 0 ? 'rgba(251,146,60,0.35)' : 'var(--border)'}`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '1rem' }}>{streak > 0 ? '🔥' : '💤'}</span>
        <div style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: streak > 0 ? 'rgb(251,146,60)' : 'var(--text-muted)' }}>
            {streak}
          </span>
          <span style={{ fontSize: '0.72rem', color: streak > 0 ? 'rgba(251,146,60,0.8)' : 'var(--text-muted)', marginLeft: '0.3rem' }}>
            {isAr ? 'يوم' : streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {earnedBadges.map(b => (
            <div
              key={b.id}
              title={isAr ? b.ar : b.en}
              style={{
                padding: '0.28rem 0.55rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                cursor: 'default',
                userSelect: 'none',
              }}
            >
              {b.icon}
            </div>
          ))}
        </div>
      )}
    </motion.div>
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

  const handleAdd = async () => {
    if (!newMs.trim()) return
    await onAddMilestone(goal.id, newMs.trim())
    setNewMs('')
    setShowInput(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${color.main}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem 0.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.65rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{goal.icon || '🎯'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            lineHeight: 1.3,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr && goal.titleAr ? goal.titleAr : goal.title}
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '0.2rem',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {done}/{total} {isAr ? 'مكتملة' : 'complete'}
            {total === 0 && <span style={{ opacity: 0.6 }}> · {isAr ? 'أضف مهام أدناه' : 'add tasks below'}</span>}
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          style={{
            width: 26, height: 26, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0, transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)'; e.currentTarget.style.background = 'var(--ruby-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          ×
        </button>
      </div>

      {/* Progress bar + checkpoints */}
      <div style={{ padding: '0 1.25rem 0.875rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.55rem' }}>
          <motion.div
            animate={{ width: `${Math.max(progress * 100, progress > 0 ? 1 : 0)}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{ height: '100%', background: color.main, borderRadius: 99 }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {THRESHOLDS.map(thresh => {
            const reached = progress >= thresh
            return (
              <div
                key={thresh}
                style={{
                  padding: '0.18rem 0.5rem',
                  borderRadius: 99,
                  background: reached ? color.dim : 'var(--bg-input)',
                  border: `1px solid ${reached ? color.main + '55' : 'var(--border)'}`,
                  fontSize: '0.65rem',
                  fontWeight: reached ? 600 : 400,
                  color: reached ? color.main : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                  transition: 'all 0.3s',
                  userSelect: 'none',
                }}
              >
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
            <motion.div
              key={ms.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '0.6rem', padding: '0.42rem 1.25rem',
              }}>
                <button
                  onClick={() => onToggle(goal.id, ms.id, milestones)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${ms.completed ? color.main : 'var(--border-strong)'}`,
                    background: ms.completed ? color.main : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.6rem', fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                >
                  {ms.completed ? '✓' : ''}
                </button>
                <span style={{
                  flex: 1,
                  fontSize: '0.85rem',
                  color: ms.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: ms.completed ? 'line-through' : 'none',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  transition: 'all 0.2s',
                }}>
                  {ms.text}
                </span>
                <button
                  onClick={() => onDeleteMilestone(goal.id, ms.id)}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: '0.95rem', padding: '0.1rem 0.25rem',
                    opacity: 0, transition: 'opacity var(--transition)',
                    lineHeight: 1,
                  }}
                  className="ms-delete-btn"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {milestones.length === 0 && !showInput && (
          <div style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr ? 'لا توجد مهام فرعية بعد.' : 'No milestones yet.'}
          </div>
        )}
      </div>

      {/* Add milestone input */}
      <div style={{ padding: '0.5rem 1.25rem 0.875rem', borderTop: '1px solid var(--border)' }}>
        {showInput ? (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              value={newMs}
              onChange={e => setNewMs(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowInput(false); setNewMs('') } }}
              placeholder={isAr ? 'اكتب مهمة فرعية...' : 'Type a milestone...'}
              autoFocus
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: `1px solid ${color.main}60`,
                borderRadius: 'var(--radius-md)',
                padding: '0.4rem 0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.83rem',
                outline: 'none',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)',
                border: 'none', background: color.main,
                color: 'var(--bg-base)', fontSize: '0.85rem', fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              +
            </button>
            <button
              onClick={() => { setShowInput(false); setNewMs('') }}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: '0.83rem', cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            style={{
              width: '100%', padding: '0.42rem',
              borderRadius: 'var(--radius-md)',
              border: `1px dashed ${color.main}50`,
              background: 'transparent', color: color.main,
              fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all var(--transition)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              opacity: 0.65,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}
          >
            + {isAr ? 'إضافة مهمة فرعية' : 'Add milestone'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── AddGoalModal ──────────────────────────────────────────────────────────────
function AddGoalModal({ onClose, onAdd, isAr, weekLabel }) {
  const [title,   setTitle]   = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [icon,    setIcon]    = useState('🎯')
  const [color,   setColor]   = useState('gold')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    await onAdd({ title: title.trim(), titleAr: titleAr.trim(), icon: icon || '🎯', color })
  }

  const c = COLOR_CSS[color]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${c.main}40`,
          borderTop: `3px solid ${c.main}`,
          width: '100%', maxWidth: 440,
          overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'هدف جديد' : 'New Goal'}
            </div>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {weekLabel}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Icon + color */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {isAr ? 'أيقونة' : 'Icon'}
              </label>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value.slice(-2) || '🎯')}
                maxLength={2}
                style={{
                  width: 54, height: 46,
                  textAlign: 'center', fontSize: '1.55rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'text', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                {isAr ? 'اللون' : 'Color'}
              </label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                {COLORS.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: COLOR_CSS[col].main,
                      border: 'none',
                      cursor: 'pointer',
                      outline: color === col ? `3px solid var(--text-primary)` : '3px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* English title */}
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'عنوان الهدف' : 'Goal Title'} <span style={{ color: c.main }}>*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isAr ? 'مثال: تحسين مهارات البرمجة' : 'e.g. Read 5 books this week'}
              required
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg-input)',
                border: `1px solid ${title ? c.main + '80' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.875rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Arabic title */}
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'العنوان بالعربية' : 'Arabic Title'}{' '}
              <span style={{ opacity: 0.5 }}>({isAr ? 'اختياري' : 'optional'})</span>
            </label>
            <input
              value={titleAr}
              onChange={e => setTitleAr(e.target.value)}
              placeholder={isAr ? 'عنوان بالعربية' : 'العنوان بالعربية'}
              dir="rtl"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.55rem 0.875rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem', outline: 'none',
                fontFamily: 'var(--font-arabic)',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: isAr ? 'flex-start' : 'flex-end', marginTop: '0.25rem' }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.5rem', borderRadius: 'var(--radius-md)',
                border: 'none', background: c.main,
                color: 'var(--bg-base)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              {isAr ? 'إضافة الهدف' : 'Add Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── PlannerPage ───────────────────────────────────────────────────────────────
export default function PlannerPage() {
  const {
    language, goals, gamification,
    addGoal, deleteGoal, addMilestone, deleteMilestone, toggleMilestone,
  } = useApp()
  const isAr = language === 'ar'

  const [weekStart,   setWeekStart]   = useState(getWeekStart)
  const [toast,       setToast]       = useState(null)
  const [showAddGoal, setShowAddGoal] = useState(false)

  const weekKey       = toDateStr(weekStart)
  const isCurrentWeek = weekKey === toDateStr(getWeekStart())
  const weekGoals     = goals.filter(g => g.weekStart === weekKey)
  const weekLabel     = formatWeekRange(weekStart, language)

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
      showToast({ icon: '🎉', title: isAr ? 'أكملت هدفاً! 🏆' : 'Goal Complete!', sub: `+${xpGain} XP` })
    } else if (newBadges.length > 0) {
      const bd = BADGES_DEF.find(b => b.id === newBadges[0])
      if (bd) showToast({ icon: bd.icon, title: `${isAr ? bd.ar : bd.en} ${isAr ? 'مفتوح!' : 'Unlocked!'}`, sub: `+${xpGain} XP` })
    } else if (leveledUp) {
      showToast({ icon: '⬆️', title: isAr ? `وصلت للمستوى ${newLevel}!` : `Level ${newLevel} Reached!`, sub: isAr ? 'تهانينا!' : 'Congratulations!' })
    } else {
      showToast({ icon: '✓', title: `+${xpGain} XP`, sub: isAr ? 'أحسنت!' : 'Nice work!' })
    }
  }

  const handleAddGoal = async (data) => {
    await addGoal({ ...data, weekStart: weekKey })
    setShowAddGoal(false)
  }

  const shiftWeek = (delta) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + delta * 7)
    setWeekStart(d)
  }

  const navBtnStyle = {
    width: 34, height: 34, borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', transition: 'all var(--transition)',
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, direction: isAr ? 'rtl' : 'ltr' }} className="planner-padding">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: isAr ? '2rem' : '2.25rem',
              fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem',
            }}>
              {isAr ? 'المخطط الأسبوعي' : 'Weekly Planner'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
              {isAr ? 'حقق أهدافك الكبيرة خطوة بخطوة واكسب النقاط' : 'Achieve big goals one milestone at a time — earn XP as you go'}
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(212,175,106,0.3)',
              background: 'var(--gold-dim)', color: 'var(--gold)',
              fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              transition: 'all var(--transition)', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,106,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-dim)'}
          >
            {isAr ? '+ هدف جديد' : '+ New Goal'}
          </button>
        </div>
      </motion.div>

      {/* XP / Gamification bar */}
      <XPBar gamification={gamification} isAr={isAr} />

      {/* Week navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.7rem 1.25rem',
        }}
      >
        <button
          style={navBtnStyle}
          onClick={() => shiftWeek(isAr ? 1 : -1)}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {isAr ? '→' : '←'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {weekLabel}
          </span>
          {isCurrentWeek && (
            <span style={{
              padding: '0.15rem 0.6rem', borderRadius: 99,
              background: 'var(--gold-dim)', color: 'var(--gold)',
              fontSize: '0.68rem', fontWeight: 600,
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {isAr ? 'هذا الأسبوع' : 'This Week'}
            </span>
          )}
        </div>

        <button
          style={navBtnStyle}
          onClick={() => shiftWeek(isAr ? -1 : 1)}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {isAr ? '←' : '→'}
        </button>
      </motion.div>

      {/* Goal cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
        className="planner-grid"
      >
        <AnimatePresence>
          {weekGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isAr={isAr}
              onToggle={handleToggle}
              onAddMilestone={addMilestone}
              onDeleteMilestone={deleteMilestone}
              onDelete={deleteGoal}
            />
          ))}
        </AnimatePresence>

        {weekGoals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎯</div>
            <div style={{
              fontWeight: 600, color: 'var(--text-primary)',
              marginBottom: '0.5rem', fontSize: '1.1rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {isAr ? 'لا توجد أهداف هذا الأسبوع' : 'No goals this week'}
            </div>
            <div style={{
              color: 'var(--text-muted)', fontSize: '0.875rem',
              marginBottom: '1.75rem', lineHeight: 1.6,
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {isAr
                ? 'أضف هدفك الأول وقسّمه إلى مهام صغيرة لتحقيقه بسهولة'
                : 'Add a big goal and break it into small milestones to crush it step by step'}
            </div>
            <button
              onClick={() => setShowAddGoal(true)}
              style={{
                padding: '0.7rem 1.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(212,175,106,0.3)',
                background: 'var(--gold-dim)', color: 'var(--gold)',
                fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,106,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-dim)'}
            >
              {isAr ? '+ إضافة هدف' : '+ Add Your First Goal'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Badges legend — shown if any earned */}
      {(gamification.badges || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            marginTop: '2rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '0.875rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.72rem', fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr ? 'شاراتك' : 'Your Badges'}
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {BADGES_DEF.map(b => {
              const earned = (gamification.badges || []).includes(b.id)
              return (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${earned ? 'var(--gold)' : 'var(--border)'}`,
                  background: earned ? 'var(--gold-dim)' : 'var(--bg-input)',
                  opacity: earned ? 1 : 0.4,
                  transition: 'all 0.3s',
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: earned ? 600 : 400,
                    color: earned ? 'var(--gold)' : 'var(--text-muted)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    {isAr ? b.ar : b.en}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <AddGoalModal
            onClose={() => setShowAddGoal(false)}
            onAdd={handleAddGoal}
            isAr={isAr}
            weekLabel={weekLabel}
          />
        )}
      </AnimatePresence>

      {/* Achievement Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 64, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 64, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-card)',
              border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.9rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              boxShadow: '0 8px 32px rgba(212,175,106,0.35), 0 0 0 1px rgba(212,175,106,0.1)',
              zIndex: 999,
              minWidth: 240, maxWidth: 360,
              direction: isAr ? 'rtl' : 'ltr',
              pointerEvents: 'none',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: '1.85rem', flexShrink: 0 }}
            >
              {toast.icon}
            </motion.span>
            <div>
              <div style={{
                fontWeight: 700, color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {toast.title}
              </div>
              <div style={{
                fontSize: '0.75rem', color: 'var(--gold)',
                marginTop: '0.1rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {toast.sub}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 600px) {
          .planner-padding { padding: 1rem !important; }
          .planner-grid { grid-template-columns: 1fr !important; }
        }
        .ms-delete-btn { opacity: 0 !important; }
        div:hover > div > .ms-delete-btn,
        div:hover > .ms-delete-btn { opacity: 0.5 !important; }
      `}</style>
    </div>
  )
}
