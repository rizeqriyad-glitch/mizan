import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

const DAY_KEYS  = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const DAYS_EN   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_AR   = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
const COLORS    = ['gold', 'emerald', 'sapphire', 'ruby']
const COLOR_CSS = { gold: 'var(--gold)', emerald: 'var(--emerald)', sapphire: 'var(--sapphire)', ruby: 'var(--ruby)' }

const BLANK = { labelEn: '', labelAr: '', icon: '📋', color: 'emerald', startTime: '', endTime: '', days: [...DAY_KEYS] }

export default function ScheduleManager() {
  const {
    language,
    scheduleType, scheduleFrequency, scheduleBlocks,
    changeScheduleType, changeScheduleFrequency,
    addScheduleBlock, editScheduleBlock, deleteScheduleBlock, reorderScheduleBlocks,
  } = useApp()
  const isAr = language === 'ar'

  const [open,         setOpen]         = useState(false)
  const [showForm,     setShowForm]     = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [form,         setForm]         = useState({ ...BLANK })

  const openAdd = () => { setForm({ ...BLANK }); setEditingBlock(null); setShowForm(true) }
  const openEdit = (b) => {
    setForm({
      labelEn:   b.label?.en   || '',
      labelAr:   b.label?.ar   || '',
      icon:      b.icon        || '📋',
      color:     b.color       || 'emerald',
      startTime: b.startTime   || '',
      endTime:   b.endTime     || '',
      days:      b.days        || [...DAY_KEYS],
    })
    setEditingBlock(b)
    setShowForm(true)
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

  const scheduleLabel = scheduleType === 'prayer'
    ? (isAr ? '🕌 مرتبط بالصلاة' : '🕌 Prayer-linked')
    : (isAr ? '⚙️ مخصص'           : '⚙️ Custom')
  const freqLabel = scheduleFrequency === 'daily'
    ? (isAr ? 'يومي' : 'Daily')
    : (isAr ? 'أسبوعي' : 'Weekly')

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      {/* ── Collapsed header ── */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.25rem', cursor: 'pointer',
          direction: isAr ? 'rtl' : 'ltr',
          transition: 'background var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {isAr ? 'الجدول الزمني' : 'Schedule'}
          </span>
          <span style={{
            fontSize: '0.72rem', padding: '0.12rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--gold-dim)', color: 'var(--gold)',
            border: '1px solid rgba(212,175,106,0.2)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {scheduleLabel} · {freqLabel}
          </span>
        </div>
        <span style={{
          fontSize: '0.68rem', color: 'var(--text-muted)',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform var(--transition)',
        }}>▼</span>
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
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', direction: isAr ? 'rtl' : 'ltr' }}>

              {/* Toggle row */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {/* Type */}
                <div style={{ flex: 1, minWidth: 190 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {isAr ? 'نوع الجدول' : 'Schedule type'}
                  </div>
                  <Seg
                    options={[
                      { value: 'prayer', label: isAr ? '🕌 الصلاة' : '🕌 Prayer' },
                      { value: 'custom', label: isAr ? '⚙️ مخصص'   : '⚙️ Custom' },
                    ]}
                    value={scheduleType}
                    onChange={changeScheduleType}
                    activeColor="var(--gold)"
                  />
                </div>

                {/* Frequency */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {isAr ? 'التكرار' : 'Frequency'}
                  </div>
                  <Seg
                    options={[
                      { value: 'daily',  label: isAr ? 'يومي'    : 'Daily'  },
                      { value: 'weekly', label: isAr ? 'أسبوعي'  : 'Weekly' },
                    ]}
                    value={scheduleFrequency}
                    onChange={changeScheduleFrequency}
                    activeColor="var(--sapphire)"
                  />
                </div>
              </div>

              {/* Prayer mode description */}
              {scheduleType === 'prayer' && (
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--gold-glow)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  lineHeight: 1.6,
                }}>
                  {isAr
                    ? 'المهام مُنظَّمة تحت أوقات الصلوات الخمس: الفجر · الظهر · العصر · المغرب · العشاء.'
                    : 'Tasks are organised under the five daily prayers: Fajr · Dhuhr · Asr · Maghrib · Isha.'}
                </div>
              )}

              {/* Custom mode block manager */}
              {scheduleType === 'custom' && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {isAr ? 'الأقسام الزمنية' : 'Time blocks'}
                    {scheduleFrequency === 'weekly' && (
                      <span style={{ marginLeft: isAr ? 0 : '0.4rem', marginRight: isAr ? '0.4rem' : 0, color: 'var(--sapphire)' }}>
                        {isAr ? '(حسب اليوم)' : '(per day)'}
                      </span>
                    )}
                  </div>

                  {scheduleBlocks.length > 0 && (
                    <Reorder.Group
                      axis="y"
                      values={scheduleBlocks}
                      onReorder={reorderScheduleBlocks}
                      style={{ listStyle: 'none', padding: 0, marginBottom: '0.5rem' }}
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
                  )}

                  {scheduleBlocks.length === 0 && !showForm && (
                    <div style={{
                      padding: '0.875rem',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}>
                      {isAr ? 'لا توجد أقسام بعد. أضف قسمًا لتبدأ.' : 'No blocks yet. Add one to get started.'}
                    </div>
                  )}

                  {!showForm && (
                    <button
                      onClick={openAdd}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.35rem', width: '100%',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--border-strong)',
                        background: 'transparent', color: 'var(--text-muted)',
                        fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all var(--transition)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                      + {isAr ? 'إضافة قسم' : 'Add block'}
                    </button>
                  )}

                  {/* ── Block form ── */}
                  <AnimatePresence>
                    {showForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSubmit}
                        style={{
                          overflow: 'hidden',
                          marginTop: '0.5rem',
                          padding: '0.875rem',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                          {editingBlock ? (isAr ? 'تعديل القسم' : 'Edit block') : (isAr ? 'قسم جديد' : 'New block')}
                        </div>

                        {/* Icon · Name EN · Name AR */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                          <input
                            value={form.icon}
                            onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                            maxLength={2}
                            style={inputStyle({ width: 44, textAlign: 'center', fontSize: '1.1rem' })}
                          />
                          <input
                            autoFocus
                            required
                            value={form.labelEn}
                            onChange={e => setForm(p => ({ ...p, labelEn: e.target.value }))}
                            placeholder="Name (English)"
                            style={inputStyle({ flex: 1 })}
                          />
                          <input
                            value={form.labelAr}
                            onChange={e => setForm(p => ({ ...p, labelAr: e.target.value }))}
                            placeholder="الاسم (عربي)"
                            dir="rtl"
                            style={inputStyle({ flex: 1, fontFamily: 'var(--font-arabic)' })}
                          />
                        </div>

                        {/* Color picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {isAr ? 'اللون:' : 'Color:'}
                          </span>
                          {COLORS.map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setForm(p => ({ ...p, color: c }))}
                              style={{
                                width: 18, height: 18, borderRadius: '50%',
                                background: COLOR_CSS[c],
                                border: form.color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                                cursor: 'pointer', padding: 0,
                                outline: 'none',
                              }}
                            />
                          ))}
                        </div>

                        {/* Time range */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {isAr ? 'الوقت:' : 'Time:'}
                          </span>
                          <input type="time" value={form.startTime}
                            onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                            style={inputStyle({ fontSize: '0.8rem' })}
                          />
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                          <input type="time" value={form.endTime}
                            onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                            style={inputStyle({ fontSize: '0.8rem' })}
                          />
                        </div>

                        {/* Day selector (weekly only) */}
                        {scheduleFrequency === 'weekly' && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                              {isAr ? 'الأيام:' : 'Days:'}
                            </div>
                            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                              {DAY_KEYS.map((key, i) => (
                                <button
                                  type="button"
                                  key={key}
                                  onClick={() => toggleDay(key)}
                                  style={{
                                    padding: '0.22rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: form.days.includes(key)
                                      ? `1px solid ${COLOR_CSS[form.color]}`
                                      : '1px solid var(--border)',
                                    background: form.days.includes(key) ? `${COLOR_CSS[form.color]}22` : 'transparent',
                                    color: form.days.includes(key) ? COLOR_CSS[form.color] : 'var(--text-muted)',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition)',
                                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                                  }}
                                >
                                  {isAr ? DAYS_AR[i] : DAYS_EN[i]}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="submit"
                            style={{
                              flex: 1, padding: '0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid rgba(212,175,106,0.4)',
                              background: 'var(--gold-dim)', color: 'var(--gold)',
                              fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                            }}
                          >
                            {isAr ? 'حفظ' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelForm}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              background: 'transparent', color: 'var(--text-muted)',
                              fontSize: '0.8rem', cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Sub-components ── */

function Seg({ options, value, onChange, activeColor }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--bg-input)',
      borderRadius: 'var(--radius-md)', padding: '3px', gap: '3px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '0.42rem 0.5rem',
            borderRadius: 'calc(var(--radius-md) - 2px)',
            border: 'none',
            background: value === opt.value ? 'var(--bg-card)' : 'transparent',
            color: value === opt.value ? activeColor : 'var(--text-muted)',
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

function BlockRow({ block, isAr, weekly, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const label    = block.label?.[isAr ? 'ar' : 'en'] || block.label?.en || ''
  const clr      = COLOR_CSS[block.color] || 'var(--emerald)'
  const dayNames = isAr ? DAYS_AR : DAYS_EN

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.4rem 0.5rem',
        borderRadius: 'var(--radius-md)',
        background: hovered ? 'var(--bg-card)' : 'transparent',
        transition: 'background var(--transition)',
        marginBottom: '0.2rem',
      }}
    >
      <span style={{ cursor: 'grab', flexShrink: 0, fontSize: '0.95rem' }}>{block.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.83rem', color: 'var(--text-primary)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ color: clr, marginRight: isAr ? 0 : '0.35rem', marginLeft: isAr ? '0.35rem' : 0 }}>●</span>
          {label}
        </div>
        {(block.startTime || (weekly && block.days?.length)) && (
          <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
            {block.startTime && `${block.startTime}${block.endTime ? ' – ' + block.endTime : ''}`}
            {weekly && block.days?.length > 0 && (
              <span style={{ marginLeft: block.startTime && !isAr ? '0.5rem' : 0, marginRight: block.startTime && isAr ? '0.5rem' : 0 }}>
                {block.days.map(d => dayNames[DAY_KEYS.indexOf(d)]).filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.2rem', opacity: hovered ? 1 : 0, transition: 'opacity var(--transition)' }}>
        <button onClick={onEdit} style={iconBtn()}>✎</button>
        <button
          onClick={onDelete}
          style={iconBtn()}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--ruby)'; e.currentTarget.style.borderColor = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >✕</button>
      </div>
    </motion.div>
  )
}

/* ── Style helpers ── */
function inputStyle(extra = {}) {
  return {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.35rem 0.5rem',
    fontSize: '0.83rem',
    color: 'var(--text-primary)',
    ...extra,
  }
}

function iconBtn() {
  return {
    width: 24, height: 24,
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
