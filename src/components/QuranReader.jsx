import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

const API = 'https://api.alquran.cloud/v1'
const NO_BISMILLAH = 9  // At-Tawbah — the only surah without Bismillah

export default function QuranReader() {
  const { language, t } = useApp()
  const isAr = language === 'ar'

  const [expanded,     setExpanded]     = useState(false)
  const [surahs,       setSurahs]       = useState([])
  const [selected,     setSelected]     = useState(1)
  const [arabicAyahs,  setArabicAyahs]  = useState([])
  const [transAyahs,   setTransAyahs]   = useState([])
  const [meta,         setMeta]         = useState(null)
  const [showTrans,    setShowTrans]     = useState(false)
  const [loadingList,  setLoadingList]  = useState(false)
  const [loadingAyahs, setLoadingAyahs] = useState(false)
  const [error,        setError]        = useState(null)
  const scrollRef = useRef(null)

  // Load surah list once
  useEffect(() => {
    if (!expanded || surahs.length) return
    setLoadingList(true)
    fetch(`${API}/surah`)
      .then(r => r.json())
      .then(d => { setSurahs(d.data || []); setLoadingList(false) })
      .catch(() => { setError('list'); setLoadingList(false) })
  }, [expanded])

  // Load ayahs on surah change
  useEffect(() => {
    if (!expanded) return
    setLoadingAyahs(true)
    setError(null)
    setArabicAyahs([])
    setTransAyahs([])
    setMeta(null)
    fetch(`${API}/surah/${selected}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json())
      .then(d => {
        const editions = d.data || []
        const ar = editions.find(e => e.edition?.identifier === 'quran-uthmani')
        const en = editions.find(e => e.edition?.identifier === 'en.sahih')
        if (ar) {
          setArabicAyahs(ar.ayahs || [])
          setMeta({
            name: ar.name,
            englishName: ar.englishName,
            translation: ar.englishNameTranslation,
            ayahCount: ar.ayahs?.length,
            revelationType: ar.revelationType,
          })
        }
        if (en) setTransAyahs(en.ayahs || [])
        setLoadingAyahs(false)
        if (scrollRef.current) scrollRef.current.scrollTop = 0
      })
      .catch(() => { setError('ayahs'); setLoadingAyahs(false) })
  }, [selected, expanded])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginTop: '1.5rem',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: 'transparent', border: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📖</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('quranTitle')}
          </span>
          {meta && expanded && (
            <span style={{
              fontSize: '0.78rem', color: 'var(--gold)',
              background: 'var(--gold-dim)',
              border: '1px solid rgba(212,175,106,0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.6rem',
              fontFamily: 'var(--font-arabic)',
            }}>
              {meta.name}
            </span>
          )}
        </div>
        <span style={{
          color: 'var(--text-muted)', fontSize: '0.8rem',
          transition: 'transform 0.2s', display: 'inline-block',
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>▼</span>
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
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
            }}>
              {loadingList ? (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  {t('quranLoading')}
                </span>
              ) : (
                <select
                  value={selected}
                  onChange={e => setSelected(Number(e.target.value))}
                  style={{
                    flex: 1, minWidth: 200,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    cursor: 'pointer',
                    direction: isAr ? 'rtl' : 'ltr',
                  }}
                >
                  {surahs.map(s => (
                    <option key={s.number} value={s.number}>
                      {isAr
                        ? `${s.number}. ${s.name}`
                        : `${s.number}. ${s.englishName} — ${s.englishNameTranslation}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setShowTrans(v => !v)}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${showTrans ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`,
                  background: showTrans ? 'var(--sapphire-dim)' : 'transparent',
                  color: showTrans ? 'var(--sapphire)' : 'var(--text-secondary)',
                  fontSize: '0.8rem', cursor: 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  flexShrink: 0,
                }}
              >
                {t('quranTranslation')}
              </button>

              {meta && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0, fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  {isAr
                    ? `${meta.ayahCount} آية`
                    : `${meta.ayahCount} verses · ${meta.revelationType}`}
                </span>
              )}
            </div>

            {/* Book area */}
            <div
              ref={scrollRef}
              style={{ maxHeight: 560, overflowY: 'auto' }}
            >
              {loadingAyahs ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  <div style={{
                    width: 28, height: 28,
                    border: '2px solid var(--border)', borderTop: '2px solid var(--gold)',
                    borderRadius: '50%', animation: 'q-spin 0.8s linear infinite',
                    margin: '0 auto 0.75rem',
                  }} />
                  {t('quranLoading')}
                </div>
              ) : error ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--ruby)', fontSize: '0.85rem', marginBottom: '0.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>{t('quranError')}</p>
                  <button onClick={() => setSelected(s => s)} style={{ fontSize: '0.8rem', color: 'var(--gold)', border: '1px solid rgba(212,175,106,0.3)', background: 'var(--gold-dim)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.8rem', cursor: 'pointer', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {t('quranRetry')}
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '1.5rem 2rem 2rem',
                  background: 'var(--bg-card)',
                  minHeight: 200,
                }}>
                  {/* Surah header */}
                  {meta && (
                    <div style={{
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '1rem',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '0.5rem 2rem',
                        background: 'var(--gold-glow)',
                        marginBottom: '0.5rem',
                      }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                          {isAr ? `سورة رقم ${selected}` : `Surah ${selected}`}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-quran)',
                          fontSize: '1.5rem',
                          color: 'var(--gold)',
                          direction: 'rtl',
                        }}>
                          {meta.name}
                        </span>
                        {!isAr && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {meta.translation}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bismillah */}
                  {selected !== 1 && selected !== NO_BISMILLAH && arabicAyahs.length > 0 && (
                    <div style={{
                      textAlign: 'center',
                      fontFamily: 'var(--font-quran)',
                      fontSize: '1.6rem',
                      color: 'var(--gold)',
                      direction: 'rtl',
                      lineHeight: 2.2,
                      marginBottom: '1rem',
                    }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>
                  )}

                  {/* Verses — book-like continuous layout */}
                  {arabicAyahs.map((ayah, i) => (
                    <motion.div
                      key={ayah.numberInSurah}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.01, 0.25) }}
                      style={{
                        marginBottom: showTrans ? '1.25rem' : 0,
                        paddingBottom: showTrans ? '1.25rem' : 0,
                        borderBottom: showTrans ? '1px dashed var(--border)' : 'none',
                      }}
                    >
                      {/* Arabic text + inline ayah number */}
                      <div style={{
                        fontFamily: 'var(--font-quran)',
                        fontSize: '1.55rem',
                        lineHeight: 2.4,
                        color: 'var(--text-primary)',
                        direction: 'rtl',
                        textAlign: 'justify',
                        display: 'inline',
                      }}>
                        {ayah.text}
                        {' '}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.6em',
                          height: '1.6em',
                          borderRadius: '50%',
                          border: '1px solid var(--gold)',
                          background: 'var(--gold-dim)',
                          color: 'var(--gold)',
                          fontSize: '0.55em',
                          verticalAlign: 'middle',
                          fontFamily: 'var(--font-arabic)',
                          fontWeight: 600,
                          lineHeight: 1,
                        }}>
                          {ayah.numberInSurah}
                        </span>
                        {' '}
                      </div>

                      {/* Translation */}
                      {showTrans && transAyahs[i] && (
                        <p style={{
                          marginTop: '0.6rem',
                          fontSize: '0.83rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.75,
                          direction: 'ltr',
                          textAlign: 'left',
                          fontStyle: 'italic',
                          paddingLeft: '0.5rem',
                          borderLeft: '2px solid var(--gold-dim)',
                        }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72em', marginRight: '0.3rem' }}>
                            ({ayah.numberInSurah})
                          </span>
                          {transAyahs[i].text}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes q-spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
