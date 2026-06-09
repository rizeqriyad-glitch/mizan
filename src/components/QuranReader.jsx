import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

const API = 'https://api.alquran.cloud/v1'
const TOTAL_PAGES = 604
const NO_BISMILLAH = 9

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadPage() {
  try {
    const n = parseInt(localStorage.getItem('mizan_quran_page') || '1', 10)
    return n >= 1 && n <= TOTAL_PAGES ? n : 1
  } catch { return 1 }
}

function loadPagesRead() {
  try {
    const raw = JSON.parse(localStorage.getItem('mizan_quran_read') || 'null')
    if (raw?.date === todayKey()) return raw.count || 0
  } catch {}
  return 0
}

function savePagesRead(count) {
  try {
    localStorage.setItem('mizan_quran_read', JSON.stringify({ date: todayKey(), count }))
  } catch {}
}

export default function QuranReader() {
  const { language, t } = useApp()
  const isAr = language === 'ar'

  const [expanded,    setExpanded]    = useState(false)
  const [page,        setPage]        = useState(loadPage)
  const [jumpInput,   setJumpInput]   = useState('')
  const [arabicAyahs, setArabicAyahs] = useState([])
  const [transAyahs,  setTransAyahs]  = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [showTrans,   setShowTrans]   = useState(false)
  const [pagesRead,   setPagesRead]   = useState(loadPagesRead)
  const [retryCount,  setRetryCount]  = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!expanded) return
    setLoading(true)
    setError(null)
    setArabicAyahs([])
    setTransAyahs([])

    // Two separate requests — the combined /editions format for pages differs from surahs
    Promise.all([
      fetch(`${API}/page/${page}/quran-uthmani`).then(r => r.json()),
      fetch(`${API}/page/${page}/en.sahih`).then(r => r.json()),
    ])
      .then(([arData, enData]) => {
        setArabicAyahs(arData.data?.ayahs || [])
        setTransAyahs(enData.data?.ayahs || [])
        setLoading(false)
        if (scrollRef.current) scrollRef.current.scrollTop = 0
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [page, expanded, retryCount])

  const navPage = useCallback((dir) => {
    const next = page + dir
    if (next < 1 || next > TOTAL_PAGES) return
    setPage(next)
    try { localStorage.setItem('mizan_quran_page', String(next)) } catch {}
    const newCount = Math.max(0, pagesRead + dir)
    setPagesRead(newCount)
    savePagesRead(newCount)
  }, [page, pagesRead])

  const jumpToPage = () => {
    const n = parseInt(jumpInput, 10)
    if (n >= 1 && n <= TOTAL_PAGES) {
      setPage(n)
      setJumpInput('')
      try { localStorage.setItem('mizan_quran_page', String(n)) } catch {}
    }
  }

  // Build render items: surah headers, bismillah, ayahs
  const renderItems = []
  let lastSurahNum = null
  for (let i = 0; i < arabicAyahs.length; i++) {
    const ayah = arabicAyahs[i]
    if (ayah.surah.number !== lastSurahNum) {
      renderItems.push({ type: 'header', surah: ayah.surah })
      if (ayah.surah.number !== 1 && ayah.surah.number !== NO_BISMILLAH) {
        renderItems.push({ type: 'bismillah' })
      }
      lastSurahNum = ayah.surah.number
    }
    renderItems.push({ type: 'ayah', ayah, trans: transAyahs[i]?.text || '' })
  }

  const surahsOnPage = [...new Set(arabicAyahs.map(a => a.surah?.name))].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px', // Mizan token for large cards
        border: '1px solid var(--v-glass-border)', // Use glass border
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '1.1rem' }}>📖</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('quranTitle')}
          </span>
          {expanded && surahsOnPage.slice(0, 2).map(name => (
            <span key={name} style={{
              fontSize: '0.75rem', color: 'var(--gold)',
              background: 'rgba(108,71,255,0.1)', border: '1px solid rgba(108,71,255,0.2)', // Mizan purple colors
              borderRadius: '9999px', // Mizan token for full-pill
              fontFamily: 'var(--font-arabic)',
            }}>{name}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {pagesRead > 0 && (
            <span style={{
              fontSize: '0.7rem', color: 'var(--emerald)',
              background: 'var(--emerald-dim)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 'var(--radius-full)', padding: '0.1rem 0.5rem',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              📜 {pagesRead} {isAr ? 'ص' : 'pg'}
            </span>
          )}
          <span style={{
            color: 'var(--text-muted)', fontSize: '0.8rem',
            transition: 'transform 0.2s', display: 'inline-block',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}>▼</span>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Controls */}
            <div style={{
              padding: '0.7rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  {isAr ? `صفحة ${page} / ${TOTAL_PAGES}` : `Page ${page} / ${TOTAL_PAGES}`}
                </span>
                {pagesRead > 0 && (
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--emerald)',
                    background: 'var(--emerald-dim)', border: '1px solid rgba(74,222,128,0.2)',
                    borderRadius: 'var(--radius-full)', padding: '0.1rem 0.5rem',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}>
                    ✦ {pagesRead} {isAr ? 'صفحة قُرئت اليوم' : 'pages read today'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowTrans(v => !v)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${showTrans ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`,
                  background: showTrans ? 'var(--sapphire-dim)' : 'transparent',
                  color: showTrans ? 'var(--sapphire)' : 'var(--text-secondary)',
                  fontSize: '0.78rem', cursor: 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}
              >
                {t('quranTranslation')}
              </button>
            </div>

            {/* Book page area */}
            <div ref={scrollRef} style={{ maxHeight: 620, overflowY: 'auto', padding: '1.25rem' }}>
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', // Mizan token for icons
                    border: '2px solid var(--v-glass-border)', borderTop: '2px solid var(--mizan-cyan)',
                    animation: 'q-spin 0.8s linear infinite', margin: '0 auto 0.75rem',
                  }} />
                  <span style={{ fontFamily: isAr ? 'var(--font-arabic)' : 'inherit', fontSize: '0.85rem' }}>
                    {t('quranLoading')}
                  </span>
                </div>
              ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--ruby)', marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {t('quranError')}
                  </p>
                  <button
                    onClick={() => { setError(null); setRetryCount(c => c + 1) }}
                    style={{ // Mizan token for buttons
                      fontSize: '0.8rem', color: 'var(--mizan-purple)',
                      border: '1px solid rgba(108,71,255,0.3)',
                      background: 'rgba(108,71,255,0.1)', borderRadius: '10px',
                      padding: '0.35rem 0.8rem', cursor: 'pointer',
                    }}
                  >
                    {t('quranRetry')}
                  </button>
                </div>
              ) : (
                <div
                  className="quran-book-page"
                  style={{
                    position: 'relative',
                    background: 'var(--v-glass-bg)', // Use glass background
                    border: '2px solid rgba(108,71,255,0.45)', // Mizan purple border
                    borderRadius: '16px', // Mizan token for large cards
                    padding: '2rem 1.75rem 1.5rem',
                    boxShadow: 'inset 0 0 60px rgba(108,71,255,0.05), 0 6px 24px rgba(0,0,0,0.15)', // Mizan purple glow
                    minHeight: 300,
                  }}
                >
                  {/* Corner ornaments */}
                  <span className="qcorner qcorner-tl">❖</span>
                  <span className="qcorner qcorner-tr">❖</span>
                  <span className="qcorner qcorner-bl">❖</span>
                  <span className="qcorner qcorner-br">❖</span>

                  {/* Inner border line */}
                  <div style={{
                    position: 'absolute', inset: 8,
                    border: '1px solid rgba(108,71,255,0.18)', // Mizan purple border
                    borderRadius: '2px',
                    pointerEvents: 'none',
                  }} />

                  {/* Content */}
                  <div style={{ direction: 'rtl', textAlign: 'justify' }}>
                    {renderItems.map((item, i) => {
                      if (item.type === 'header') {
                        return (
                          <div key={`h-${i}`} style={{
                            textAlign: 'center',
                            margin: i === 0 ? '0 0 1.5rem' : '2rem 0 1.5rem',
                          }}>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                              border: '1px solid rgba(212,175,106,0.35)',
                              borderRadius: '10px', // Mizan token for buttons
                              padding: '0.5rem 2rem',
                              background: 'linear-gradient(135deg, rgba(108,71,255,0.1) 0%, transparent 100%)', // Mizan gradient
                            }}>
                              <span style={{ color: 'rgba(108,71,255,0.6)', fontSize: '0.6rem' }}>◆</span> {/* Keep color for ornament */}
                              <div>
                                <div style={{
                                  fontFamily: 'var(--font-quran)',
                                  fontSize: '1.2rem', color: 'var(--mizan-purple)', // Mizan purple color
                                  direction: 'rtl', lineHeight: 1.5,
                                }}>
                                  {item.surah.name}
                                </div>
                                {!isAr && (
                                  <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: '0.1rem', direction: 'ltr' }}>
                                    {item.surah.englishName} · {item.surah.englishNameTranslation} · {item.surah.numberOfAyahs} verses
                                  </div>
                                )}
                              </div> {/* Keep ornament */}
                              <span style={{ color: 'rgba(108,71,255,0.6)', fontSize: '0.6rem' }}>◆</span> {/* Keep color for ornament */}
                            </div>
                          </div>
                        )
                      }

                      if (item.type === 'bismillah') {
                        return (
                          <div key={`b-${i}`} style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-quran)',
                            fontSize: '1.5rem', color: 'var(--mizan-purple)', // Mizan purple color
                            direction: 'rtl', lineHeight: 2.4,
                            marginBottom: '0.25rem',
                          }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                          </div>
                        )
                      }

                      // Ayah
                      const { ayah, trans } = item
                      return (
                        <span key={`a-${ayah.number}`} style={{ display: showTrans && trans ? 'block' : 'inline' }}>
                          <span style={{
                            fontFamily: 'var(--font-quran)',
                            fontSize: '1.55rem',
                            lineHeight: 2.5,
                            color: 'var(--text-primary)',
                            display: 'inline',
                          }}>
                            {ayah.text}
                            {' '}
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '1.6em', height: '1.6em', borderRadius: '50%',
                              border: '1px solid rgba(108,71,255,0.5)', // Mizan purple border
                              background: 'rgba(108,71,255,0.1)', color: 'var(--mizan-purple)', // Mizan purple colors
                              fontSize: '0.5em', fontFamily: 'var(--font-arabic)',
                              fontWeight: 600, verticalAlign: 'middle', lineHeight: 1,
                            }}>
                              {ayah.numberInSurah}
                            </span>
                            {' '}
                          </span>
                          {showTrans && trans && (
                            <p style={{
                              margin: '0.3rem 0 0.9rem',
                              fontSize: '0.8rem', color: 'var(--text-secondary)',
                              lineHeight: 1.75, direction: 'ltr', textAlign: 'left',
                              fontStyle: 'italic', // Keep italic for translation
                              paddingLeft: '0.6rem', // Keep padding
                              borderLeft: '2px solid rgba(108,71,255,0.3)', // Mizan purple border
                            }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.7em', marginRight: '0.25rem' }}>
                                ({ayah.numberInSurah})
                              </span>
                              {trans}
                            </p>
                          )}
                        </span>
                      )
                    })}
                  </div>

                  {/* Page number */}
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(108,71,255,0.2)', // Mizan purple border
                    textAlign: 'center',
                    color: 'var(--mizan-purple)', // Mizan purple color
                    fontSize: '0.78rem',
                    letterSpacing: '0.12em',
                    opacity: 0.7,
                    fontFamily: 'var(--font-arabic)',
                  }}>
                    ❖ {page} ❖
                  </div>
                </div>
              )}
            </div>

            {/* Navigation bar */}
            <div style={{
              padding: '0.875rem 1.25rem',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '0.75rem',
            }}>
              {/* Prev */}
              <button
                onClick={() => navPage(-1)}
                disabled={page <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: page <= 1 ? 'var(--border-strong)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  cursor: page <= 1 ? 'default' : 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                {isAr ? '▶' : '◀'}{' '}{isAr ? 'السابقة' : 'Prev'}
              </button>

              {/* Jump */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="number"
                  min="1"
                  max={TOTAL_PAGES}
                  value={jumpInput}
                  onChange={e => setJumpInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && jumpToPage()}
                  placeholder={String(page)}
                  style={{
                    width: 64, padding: '0.4rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem', textAlign: 'center',
                  }}
                />
                <button
                  onClick={jumpToPage}
                  style={{
                    padding: '0.4rem 0.75rem', // Mizan token for buttons
                    borderRadius: '8px', // Mizan token for buttons
                    border: '1px solid rgba(108,71,255,0.3)', // Mizan purple border
                    background: 'rgba(108,71,255,0.1)', color: 'var(--mizan-purple)', // Mizan purple colors
                    fontSize: '0.78rem', cursor: 'pointer',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  {isAr ? 'انتقل' : 'Go'}
                </button>
              </div>

              {/* Next */}
              <button
                onClick={() => navPage(1)}
                disabled={page >= TOTAL_PAGES}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: page >= TOTAL_PAGES ? 'var(--border-strong)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  cursor: page >= TOTAL_PAGES ? 'default' : 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}
              >
                {isAr ? 'التالية' : 'Next'}{' '}{isAr ? '◀' : '▶'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes q-spin { to { transform: rotate(360deg); } }
        .qcorner {
          position: absolute;
          color: rgba(212,175,106,0.45);
          font-size: 0.8rem;
          line-height: 1;
          pointer-events: none;
        }
        .qcorner-tl { top: 7px; left: 9px; }
        .qcorner-tr { top: 7px; right: 9px; }
        .qcorner-bl { bottom: 7px; left: 9px; }
        .qcorner-br { bottom: 7px; right: 9px; }
      `}</style>
    </motion.div>
  )
}
