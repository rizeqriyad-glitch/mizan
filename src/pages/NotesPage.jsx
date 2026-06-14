import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useI18n } from '../contexts/I18nContext'
import { glyph } from '../components/glyphs'
import { useAuth } from '../contexts/AuthContext'
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIES = ['catGeneral', 'catQuran', 'catHadith', 'catFiqh', 'catReminder']

const CAT_COLORS = {
  // Crimson-carrot ONLY — no off-palette hues. Categories read by their label;
  // deep shades (600–800) add subtle variety while keeping AA contrast on the tint.
  catGeneral:  { color: 'var(--jet-300)', bg: 'rgba(164, 169, 193, 0.10)' },
  catQuran:    { color: 'var(--jet-400)', bg: 'rgba(164, 169, 193, 0.10)' },
  catHadith:   { color: 'var(--jet-300)', bg: 'rgba(164, 169, 193, 0.10)' },
  catFiqh:     { color: 'var(--jet-300)', bg: 'rgba(103, 112, 152, 0.12)' },
  catReminder: { color: 'var(--jet-400)', bg: 'rgba(164, 169, 193, 0.10)' },
}

export default function NotesPage() {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [notes,       setNotes]       = useState([])
  const [text,        setText]        = useState('')
  const [category,    setCategory]    = useState('catGeneral')
  const [saving,      setSaving]      = useState(false)
  const [saveMsg,     setSaveMsg]     = useState(null)
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('all')

  // Load notes from user document
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      snap => {
        const notesMap = snap.data()?.notes || {}
        const list = Object.entries(notesMap)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
        setNotes(list)
      },
      err => console.error('Notes listener error:', err)
    )
    return unsub
  }, [user])

  const handleSave = async () => {
    if (!text.trim() || !user || saving) return
    setSaving(true)
    setSaveMsg(null)
    const noteId = String(Date.now())
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`notes.${noteId}`]: {
          text:        text.trim(),
          category,
          createdAtMs: Date.now(),
          language,
        },
      })
      setText('')
      setSaveMsg({ type: 'ok', text: t('notesSaved') })
      setTimeout(() => setSaveMsg(null), 2500)
    } catch (err) {
      console.error('Save note failed:', err)
      setSaveMsg({ type: 'err', text: t('notesSaveError') })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noteId) => {
    if (!user) return
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [`notes.${noteId}`]: deleteField(),
      })
    } catch (err) {
      console.error('Delete note failed:', err)
    }
  }

  const formatDate = (ms) => {
    if (!ms) return ''
    return new Date(ms).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  const filtered = notes.filter(n => {
    const matchCat = filterCat === 'all' || n.category === filterCat
    const matchSearch = !search.trim() || n.text.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Group by month for organized display
  const grouped = {}
  filtered.forEach(note => {
    const key = note.createdAtMs
      ? new Date(note.createdAtMs).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })
      : (isAr ? 'أقدم' : 'Older')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(note)
  })

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 900,
      direction: isAr ? 'rtl' : 'ltr',
    }}
    className="notes-padding"
    data-reveal
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{
              fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: isAr ? '1.8rem' : '2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: '0.3rem',
            }}>
              {t('notesPageTitle')}
            </h1>
            <p style={{
              fontSize: '0.82rem', color: 'var(--text-muted)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {notes.length > 0
                ? (isAr ? `${notes.length} ملاحظة محفوظة` : `${notes.length} saved note${notes.length !== 1 ? 's' : ''}`)
                : (isAr ? 'لا توجد ملاحظات بعد' : 'No notes yet')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add note form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('addNote')}
          rows={4}
          style={{
            width: '100%', resize: 'vertical', minHeight: '100px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            padding: '0.75rem',
            fontSize: '0.9rem',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            direction: isAr ? 'rtl' : 'ltr',
            lineHeight: 1.6,
            marginBottom: '0.75rem',
            outline: 'none',
            transition: 'border-color var(--transition)',
          }} /* Update focus color */
          onFocus={e => e.target.style.borderColor = 'var(--mizan-purple)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave() }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Category pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map(cat => {
              const sel = category === cat
              const c   = CAT_COLORS[cat]
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${sel ? c.color : 'var(--v-glass-border)'}`,
                    background: sel ? c.bg : 'transparent',
                    color: sel ? c.color : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all var(--transition)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    fontWeight: sel ? 500 : 400,
                  }}
                >
                  {t(cat)}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '10px',
              background: text.trim() ? 'var(--mizan-purple)' : 'var(--bg-input)',
              border: `1px solid ${text.trim() ? 'var(--mizan-purple)' : 'var(--v-glass-border)'}`,
              color: text.trim() ? 'white' : 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: text.trim() && !saving ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              flexShrink: 0,
            }}
          >
            {saving ? '⏳' : t('saveNote')}
          </button>
        </div>

        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '0.6rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: saveMsg.type === 'ok' ? 'var(--emerald-dim)' : 'var(--ruby-dim)',
                color: saveMsg.type === 'ok' ? 'var(--emerald)' : 'var(--ruby)',
                fontSize: '0.78rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              {saveMsg.type === 'ok' ? '✓ ' : '✕ '}{saveMsg.text}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search + filter bar */}
      {notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
            marginBottom: '1.25rem', alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('notesSearch')}
              style={{
                width: '100%',
                background: 'var(--v-glass-bg)',
                border: '1px solid var(--v-glass-border)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                padding: isAr ? '0.5rem 0.75rem 0.5rem 2rem' : '0.5rem 2rem 0.5rem 0.75rem',
                fontSize: '0.83rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                direction: isAr ? 'rtl' : 'ltr',
                outline: 'none',
              }}
            />
            <span style={{
              position: 'absolute',
              top: '50%', transform: 'translateY(-50%)',
              [isAr ? 'left' : 'right']: '0.6rem',
              color: 'var(--text-muted)', fontSize: '0.8rem',
              pointerEvents: 'none',
            }}>{glyph('search', 14)}</span>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterCat('all')}
              style={{
                fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${filterCat === 'all' ? 'var(--mizan-purple)' : 'var(--v-glass-border)'}`,
                background: filterCat === 'all' ? 'rgba(164, 169, 193,0.1)' : 'transparent',
                color: filterCat === 'all' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}
            >
              {t('notesAll')}
            </button>
            {CATEGORIES.map(cat => {
              const c = CAT_COLORS[cat]
              const active = filterCat === cat
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(active ? 'all' : cat)}
                  style={{
                    fontSize: '0.72rem', padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${active ? c.color : 'var(--border)'}`,
                    background: active ? c.bg : 'transparent',
                    color: active ? c.color : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  {t(cat)}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Notes grouped by month */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '4rem 2rem', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '0.88rem',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
        >
          {search || filterCat !== 'all'
            ? (isAr ? 'لا توجد نتائج' : 'No matching notes')
            : t('notesEmpty')}
        </motion.div>
      ) : (
        Object.entries(grouped).map(([month, monthNotes]) => (
          <div key={month} style={{ marginBottom: '2rem' }}>
            {/* Month header */}
            <div style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '0.75rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <span>{month}</span>
              <span style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--v-glass-border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.05rem 0.45rem',
                fontSize: '0.65rem',
              }}>
                {monthNotes.length}
              </span>
            </div>

            {/* Notes grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
            }}
            className="notes-grid"
            >
              <AnimatePresence>
                {monthNotes.map((note, i) => {
                  const c = CAT_COLORS[note.category] || CAT_COLORS.catGeneral
                  return (
                    <motion.div
                      key={note.id} // Keep key
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card"
                      style={{
                        borderRadius: '16px', // Mizan token for large cards
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'border-color var(--transition)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--mizan-purple)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--v-glass-border)'}
                    >
                      {/* Color top bar */}
                      <div style={{
                        height: 3,
                        background: `linear-gradient(90deg, ${c.color}, transparent)`,
                        opacity: 0.7,
                      }} />

                      <div style={{ padding: '0.9rem 1rem' }}>
                        {/* Category + date row */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.55rem',
                          flexDirection: isAr ? 'row-reverse' : 'row',
                        }}>
                          <span style={{
                            fontSize: '0.65rem', padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-full)',
                            background: c.bg, color: c.color,
                            border: `1px solid ${c.color}33`,
                            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                            fontWeight: 500,
                          }}>
                            {t(note.category || 'catGeneral')}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {formatDate(note.createdAtMs)}
                          </span>
                        </div>

                        {/* Note text */}
                        <p style={{
                          fontSize: '0.875rem', color: 'var(--text-primary)',
                          lineHeight: 1.7, margin: '0 0 0.75rem',
                          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                          direction: isAr ? 'rtl' : 'ltr',
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        }}>
                          {note.text}
                        </p>

                        {/* Delete */}
                        <div style={{ display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
                          <button
                            onClick={() => handleDelete(note.id)}
                            title={t('deleteNote')}
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid transparent',
                              background: 'transparent',
                              color: 'var(--text-muted)',
                              fontSize: '0.72rem', cursor: 'pointer',
                              transition: 'all var(--transition)',
                              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--ruby-dim)'
                              e.currentTarget.style.color = 'var(--ruby)'
                              e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'var(--text-muted)'
                              e.currentTarget.style.borderColor = 'transparent'
                            }}
                          >
                            {isAr ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        ))
      )}

      <style>{`
        @media (max-width: 768px) {
          .notes-padding { padding: 1rem !important; }
          .notes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
