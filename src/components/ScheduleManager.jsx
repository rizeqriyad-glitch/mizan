import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'motion/react'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAYS_EN  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_AR  = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
const COLORS   = ['gold', 'emerald', 'sapphire', 'ruby']
const COLOR_CSS = {
  gold:     'var(--gold)',
  emerald:  'var(--emerald)',
  sapphire: 'var(--sapphire)',
  ruby:     'var(--ruby)',
}
const COLOR_DIM = {
  gold:     'var(--gold-dim)',
  emerald:  'var(--emerald-dim)',
  sapphire: 'var(--sapphire-dim)',
  ruby:     'var(--ruby-dim)',
}

const BLANK = { labelEn: '', labelAr: '', icon: '📋', color: 'emerald', startTime: '', endTime: '', days: [] }

export default function ScheduleManager() {
  const {
    scheduleFrequency, scheduleBlocks,
    changeScheduleFrequency,
    addScheduleBlock, editScheduleBlock, deleteScheduleBlock, reorderScheduleBlocks,
  } = useApp()
  const { language } = useI18n()
  const isAr = language === 'ar'

  const [open,         setOpen]         = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [form,         setForm]         = useState({ ...BLANK })

  const openAdd = () => {
    setForm({ ...BLANK })
    setEditingBlock(null)
    setShowForm(true)
    setOpen(true)
  }
  const openEdit = (b) => {
    setForm({
      labelEn:   b.label?.en || '',
      labelAr:   b.label?.ar || '',
      icon:      b.icon      || '📋',
      color:     b.color     || 'emerald',
      startTime: b.startTime || '',
      endTime:   b.endTime   || '',
      days:      b.days      || [...DAY_KEYS],
    })
    setEditingBlock(b)
    setShowForm(true)
    setOpen(true)
  }
  const cancelForm = () => { setShowForm(false); setEditingBlock(null) }

  const toggleDay = (key) =>
    setForm(p => ({
      ...p,
      days: p.days.includes(key) ? p.days.filter(d => d !== key) : [...p.days, key],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.labelEn.trim()) return
    const data = {
      label:     { en: form.labelEn.trim(), ar: form.labelAr.trim() || form.labelEn.trim() },
      icon:      form.icon,
      color:     form.color,
      startTime: form.startTime || null,
      endTime:   form.endTime   || null,
      days:      form.days,
    }
    if (editingBlock) await editScheduleBlock(editingBlock.id, data)
    else              await addScheduleBlock(data)
    cancelForm()
  }

  const activeColor = COLOR_CSS[form.color] || 'var(--emerald)'

  return (
    <div className="glass-card" style={{
      // background: 'var(--bg-card)', // Handled by glass-card
      borderRadius: '16px', // Mizan token for large cards
      // border: '1px solid var(--border)', // Handled by glass-card
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0.7rem 1.25rem',
        direction: isAr ? 'rtl' : 'ltr',
        gap: '0.6rem',
      }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, flex: 1,
          }}
        >
          <span style={{
            fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--text-secondary)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr ? 'الأقسام المخصصة' : 'Custom Blocks'}
          </span>
          {scheduleBlocks.length > 0 && (
            <span style={{
              fontSize: '0.67rem', padding: '0.1rem 0.42rem',
              borderRadius: 'var(--radius-full)',
            background: 'rgba(201, 56, 3,0.1)', color: 'var(--mizan-cyan)', // Mizan cyan
              fontWeight: 600,
            }}>
              {scheduleBlocks.length}
            </span>
          )}
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            marginInlineStart: 'auto',
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition)',
          }}>▼</span>
        </button>

        <button
          onClick={openAdd}
          style={{
            padding: '0.28rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-strong)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', // Keep font family
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--mizan-purple)' // Mizan purple
            e.currentTarget.style.color = 'var(--mizan-purple)' // Mizan purple
            e.currentTarget.style.background = 'rgba(251, 70, 4,0.1)' // Mizan purple dim
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          + {isAr ? 'إضافة' : 'Add'}
        </button>
      </div>

      {/* ── Expanded panel ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid var(--border)', direction: isAr ? 'rtl' : 'ltr' }}>

              {/* Frequency row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', flexShrink: 0 }}>
                  {isAr ? 'التكرار:' : 'Repeats:'}
                </span>
                <Seg
                  options={[
                    { value: 'daily',  label: isAr ? 'يومي'   : 'Daily'  },
                    { value: 'weekly', label: isAr ? 'أسبوعي' : 'Weekly' },
                  ]}
                  value={scheduleFrequency}
                  onChange={changeScheduleFrequency}
                />
              </div>

              {/* Block list */}
              {scheduleBlocks.length === 0 && !showForm ? (
                <div style={{
                  padding: '1.5rem',
                  textAlign: 'center', // Keep text alignment
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}>
                  {isAr ? 'لا توجد أقسام مخصصة. أضف قسماً للبدء.' : 'No custom blocks yet. Add one to get started.'}
                </div>
              ) : (
                scheduleBlocks.length > 0 && (
                  <div style={{ padding: '0.5rem 1.25rem 0.25rem' }}>
                    <Reorder.Group
                      axis="y"
                      values={scheduleBlocks}
                      onReorder={reorderScheduleBlocks}
                      style={{ listStyle: 'none', padding: 0 }}
                    >
                      {scheduleBlocks.map(block => (
                        <Reorder.Item key={block.id} value={block} style={{ listStyle: 'none' }}>
                          <BlockRow
                            block={block}
                            isAr={isAr}
                            weekly={scheduleFrequency === 'weekly'}
                            onEdit={() => openEdit(block)}
                            onDelete={() => deleteScheduleBlock(block.id)}
                          />
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )
              )}

              {/* Add block button */}
              {!showForm && (
                <div style={{ padding: '0.5rem 1.25rem 0.75rem' }}>
                  <button
                    onClick={openAdd}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.35rem', width: '100%', padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-strong)',
                      background: 'transparent', color: 'var(--text-muted)',
                      fontSize: '0.78rem', cursor: 'pointer',
                      transition: 'all var(--transition)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                  >
                    + {isAr ? 'إضافة قسم جديد' : 'Add new block'}
                  </button>
                </div>
              )}

              {/* ── Inline form ── */}
              <AnimatePresence>
                {showForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmit}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      margin: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid var(--v-glass-border)`, // Use glass border
                      borderTop: `3px solid ${activeColor}`,
                      background: 'var(--bg-input)',
                      overflow: 'hidden',
                    }}>
                      {/* Form header */}
                      <div style={{
                        padding: '0.75rem 1rem 0',
                        fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: activeColor,
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      }}>
                        {editingBlock ? (isAr ? 'تعديل القسم' : 'Edit Block') : (isAr ? 'قسم جديد' : 'New Block')}
                      </div>

                      <div style={{ padding: '0.625rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                        {/* Icon + Name EN + Name AR */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            value={form.icon}
                            onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                            maxLength={2}
                            style={iStyle({ width: 46, textAlign: 'center', fontSize: '1.2rem' })}
                          />
                          <input
                            autoFocus
                            required
                            value={form.labelEn}
                            onChange={e => setForm(p => ({ ...p, labelEn: e.target.value }))}
                            placeholder={isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}
                            style={iStyle({ flex: 1 })}
                          />
                          <input
                            value={form.labelAr}
                            onChange={e => setForm(p => ({ ...p, labelAr: e.target.value }))}
                            placeholder="الاسم (عربي)"
                            dir="rtl"
                            style={iStyle({ flex: 1, fontFamily: 'var(--font-arabic)' })}
                          />
                        </div>

                        {/* Color + Time */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {isAr ? 'اللون' : 'Color'}
                            </span>
                            {COLORS.map(c => (
                              <button type="button" key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                                style={{
                                  width: 22, height: 22, borderRadius: '50%',
                                  background: COLOR_CSS[c], border: 'none', cursor: 'pointer', padding: 0,
                                  outline: form.color === c ? `3px solid ${COLOR_CSS[c]}` : '3px solid transparent',
                                  outlineOffset: 2, transition: 'all 0.12s',
                                }}
                              />
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {isAr ? 'الوقت' : 'Time'}
                            </span>
                            <input type="time" value={form.startTime}
                              onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                              style={iStyle({ width: 108, colorScheme: 'dark' })}
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>–</span>
                            <input type="time" value={form.endTime}
                              onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                              style={iStyle({ width: 108, colorScheme: 'dark' })}
                            />
                          </div>
                        </div>

                        {/* Day selector — weekly mode only */}
                        {scheduleFrequency === 'weekly' && (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                                {isAr ? 'الأيام' : 'Days'}
                              </span>
                              {form.days.length === 0 && (
                                <span style={{ fontSize: '0.62rem', color: 'var(--ruby)', background: 'var(--ruby-dim)', padding: '0.06rem 0.45rem', borderRadius: 99 }}>
                                  {isAr ? 'اختر يوماً على الأقل' : 'select at least one'}
                                </span>
                              )}
                              {form.days.length > 0 && (
                                <span style={{ fontSize: '0.62rem', color: activeColor, background: activeColor + '18', padding: '0.06rem 0.45rem', borderRadius: 99 }}>
                                  {form.days.length} {isAr ? 'أيام' : 'days'}
                                </span>
                          )} {/* Badge for days selected */}
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {DAY_KEYS.map((key, i) => {
                                const on = form.days.includes(key)
                                return (
                                  <button type="button" key={key} onClick={() => toggleDay(key)}
                                    style={{
                                      width: 42, height: 42, borderRadius: '50%',
                                      border: `2px solid ${on ? activeColor : 'var(--v-glass-border)'}`, // Use glass border
                                      background: on ? activeColor : 'transparent',
                                      color: on ? '#fff' : 'var(--text-muted)',
                                      fontSize: '0.68rem', fontWeight: on ? 700 : 400,
                                      cursor: 'pointer', transition: 'all 0.18s',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                                      boxShadow: on ? `0 2px 8px ${activeColor}45` : 'none',
                                      transform: on ? 'scale(1.08)' : 'scale(1)',
                                    }}
                                  >
                                    {isAr ? DAYS_AR[i] : DAYS_EN[i]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.15rem' }}>
                          <button type="submit" style={{
                            flex: 1, height: 36,
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: activeColor,
                            color: '#fff',
                            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                          }}>
                            {isAr ? 'حفظ' : 'Save'}
                          </button>
                          <button type="button" onClick={cancelForm} style={{
                            height: 36, padding: '0 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--text-muted)', // Keep transparent
                            fontSize: '0.82rem', cursor: 'pointer',
                          }}>
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────────
function Seg({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--bg-input)',
      borderRadius: 'var(--radius-md)', padding: '3px', gap: '3px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
            style={{ // Segmented control buttons
            padding: '0.3rem 0.75rem',
            borderRadius: 'calc(var(--radius-md) - 2px)',
            border: 'none',
            background: value === opt.value ? 'var(--bg-card)' : 'transparent',
            color: value === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '0.78rem',
            fontWeight: value === opt.value ? 500 : 400,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── Block list row ────────────────────────────────────────────────────────────
function BlockRow({ block, isAr, weekly, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const label    = block.label?.[isAr ? 'ar' : 'en'] || block.label?.en || ''
  const clr      = COLOR_CSS[block.color] || 'var(--emerald)'
  const clrD     = COLOR_DIM[block.color] || 'var(--emerald-dim)'
  const dayNames = isAr ? DAYS_AR : DAYS_EN

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.45rem 0.4rem',
        borderRadius: 'var(--radius-md)',
        background: hovered ? 'var(--bg-card-hover)' : 'transparent',
        transition: 'background var(--transition)',
        marginBottom: '0.1rem',
        cursor: 'grab',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        background: clrD, border: `1px solid ${clr}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', // Keep icon styling
        fontSize: '0.9rem',
      }}>
        {block.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: clr, flexShrink: 0 }} />
          <span style={{
            fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: 500,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {label}
          </span>
        </div>
        {(block.startTime || (weekly && block.days?.length > 0)) && (
          <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {block.startTime && `${block.startTime}${block.endTime ? ' – ' + block.endTime : ''}`}
            {weekly && block.days?.length > 0 && (
              <span style={{ marginInlineStart: block.startTime ? '0.5rem' : 0 }}>
                {block.days.map(d => dayNames[DAY_KEYS.indexOf(d)]).filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.2rem', opacity: hovered ? 1 : 0, transition: 'opacity var(--transition)', flexShrink: 0 }}>
        <button onClick={onEdit} style={iconBtn()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sapphire)'; e.currentTarget.style.color = 'var(--sapphire)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >✎</button>
        <button onClick={onDelete} style={iconBtn()}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >✕</button>
      </div>
    </motion.div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function iStyle(extra = {}) {
  return {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0.4rem 0.6rem',
    fontSize: '0.83rem',
    color: 'var(--text-primary)',
    outline: 'none',
    ...extra,
  }
}

function iconBtn() {
  return {
    width: 26, height: 26,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  }
}
