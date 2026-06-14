import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useI18n } from '../contexts/I18nContext'
import { glyph } from './glyphs'
import { useAuth } from '../contexts/AuthContext'
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase'

export const CATEGORIES = ['catGeneral', 'catQuran', 'catHadith', 'catFiqh', 'catReminder']

export const CAT_COLORS = {
  catGeneral:  { color: 'var(--sapphire)',  bg: 'var(--sapphire-dim)'  },
  catQuran:    { color: 'var(--gold)',       bg: 'var(--gold-dim)'      },
  catHadith:   { color: 'var(--emerald)',    bg: 'var(--emerald-dim)'   },
  catFiqh:     { color: 'var(--amber)',      bg: 'var(--amber-dim)'     },
  catReminder: { color: 'var(--ruby)',       bg: 'var(--ruby-dim)'      },
}

export default function NotesSection() {
  const { language, t } = useI18n()
  const { user } = useAuth()
  const isAr = language === 'ar'

  const [notes,    setNotes]    = useState([])
  const [text,     setText]     = useState('')
  const [category, setCategory] = useState('catGeneral')
  const [saving,   setSaving]   = useState(false)
  const [saveMsg,  setSaveMsg]  = useState(null)
  const [expanded, setExpanded] = useState(true)

  // Store notes inside the user document (notes.{id} fields) — works with existing Firestore rules
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
    try {
      return new Date(ms).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    } catch { return '' }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        // background: 'var(--bg-card)', // Handled by glass-card
        borderRadius: '16px', // Mizan token for large cards
        // border: '1px solid var(--border)', // Handled by glass-card
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>{glyph('pencil')}</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('notesTitle')}
          </span>
          {notes.length > 0 && (
            <span style={{
              fontSize: '0.7rem',
              background: 'var(--gold-dim)', color: 'var(--gold)',
            border: '1px solid rgba(251, 70, 4,0.2)', // Mizan purple border
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.5rem',
            }}>
              {notes.length}
            </span>
          )}
        </div>
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.8rem',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'inline-block',
        }}>▼</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Input area */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={t('addNote')}
                rows={3}
                style={{
                  width: '100%', resize: 'vertical',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.6rem 0.75rem',
                  fontSize: '0.88rem',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  direction: isAr ? 'rtl' : 'ltr',
                  lineHeight: 1.6,
                  marginBottom: '0.6rem',
                }}
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
                          fontSize: '0.72rem', padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${sel ? c.color : 'var(--border)'}`,
                          background: sel ? c.bg : 'transparent',
                          color: sel ? c.color : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all var(--transition)',
                          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                        }}
                      >
                        {t(cat)}
                      </button>
                    )
                  })}
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={!text.trim() || saving}
                  style={{
                    padding: '0.4rem 1.1rem',
                    borderRadius: '10px', // Mizan token for buttons
                    background: text.trim() ? 'rgba(251, 70, 4,0.1)' : 'transparent', // Mizan purple background
                    border: `1px solid ${text.trim() ? 'rgba(251, 70, 4,0.3)' : 'var(--v-glass-border)'}`, // Mizan purple border
                    color: text.trim() ? 'var(--gold)' : 'var(--text-muted)',
                    fontSize: '0.82rem', fontWeight: 500,
                    cursor: text.trim() && !saving ? 'pointer' : 'not-allowed',
                    transition: 'all var(--transition)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    flexShrink: 0,
                  }}
                >
                  {saving ? '⏳' : t('saveNote')}
                </button>
              </div>

              {/* Save feedback */}
              <AnimatePresence>
                {saveMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      marginTop: '0.5rem',
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
            </div>

            {/* Notes list */}
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0.5rem 0' }}>
              {notes.length === 0 ? (
                <div style={{
                  padding: '2.5rem 1.25rem', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '0.83rem',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}>
                  {t('noNotes')}
                </div>
              ) : (
                <AnimatePresence>
                  {notes.map((note, i) => {
                    const c = CAT_COLORS[note.category] || CAT_COLORS.catGeneral
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: isAr ? 20 : -20 }}
                        transition={{ delay: Math.min(i * 0.03, 0.2) }}
                        style={{
                          padding: '0.85rem 1.25rem',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                        }}
                      >
                        {/* Colour bar */}
                        <div style={{
                          flexShrink: 0, width: 3,
                          alignSelf: 'stretch',
                          borderRadius: 2,
                          background: c.color,
                          opacity: 0.6,
                        }} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            marginBottom: '0.35rem', flexWrap: 'wrap',
                            flexDirection: isAr ? 'row-reverse' : 'row',
                          }}>
                            <span style={{
                              fontSize: '0.68rem', padding: '0.1rem 0.45rem',
                              borderRadius: 'var(--radius-full)',
                              background: c.bg, color: c.color,
                              border: `1px solid ${c.color}33`,
                              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                            }}>
                              {t(note.category || 'catGeneral')}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {formatDate(note.createdAtMs)}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '0.87rem', color: 'var(--text-primary)',
                            lineHeight: 1.7,
                            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                            direction: isAr ? 'rtl' : 'ltr',
                            margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          }}>
                            {note.text}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(note.id)}
                          title={t('deleteNote')}
                          style={{
                            width: 26, height: 26,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid transparent', background: 'transparent',
                            color: 'var(--text-muted)', fontSize: '0.8rem',
                            cursor: 'pointer', transition: 'all var(--transition)',
                            flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--ruby-dim)'; e.currentTarget.style.color = 'var(--ruby)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent' }}
                        >
                          ✕
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
