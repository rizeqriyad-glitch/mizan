import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

const API_BASE = 'https://api.alquran.cloud/v1'

// Surah 9 (At-Tawbah) is the only surah without Bismillah
const NO_BISMILLAH = 9

export default function QuranReader() {
  const { language, t } = useApp()
  const isAr = language === 'ar'

  const [expanded,      setExpanded]      = useState(false)
  const [surahs,        setSurahs]        = useState([])
  const [selectedSurah, setSelectedSurah] = useState(1)
  const [arabicAyahs,   setArabicAyahs]   = useState([])
  const [transAyahs,    setTransAyahs]    = useState([])
  const [surahMeta,     setSurahMeta]     = useState(null)
  const [showTrans,     setShowTrans]     = useState(false)
  const [loadingSurahs, setLoadingSurahs] = useState(false)
  const [loadingAyahs,  setLoadingAyahs]  = useState(false)
  const [error,         setError]         = useState(null)
  const versesRef = useRef(null)

  // Fetch surah list once
  useEffect(() => {
    if (!expanded || surahs.length > 0) return
    setLoadingSurahs(true)
    fetch(`${API_BASE}/surah`)
      .then(r => r.json())
      .then(data => { setSurahs(data.data || []); setLoadingSurahs(false) })
      .catch(() => { setError('surahs'); setLoadingSurahs(false) })
  }, [expanded])

  // Fetch verses when surah changes (and section is open)
  useEffect(() => {
    if (!expanded) return
    setLoadingAyahs(true)
    setError(null)
    setArabicAyahs([])
    setTransAyahs([])
    setSurahMeta(null)

    fetch(`${API_BASE}/surah/${selectedSurah}/editions/quran-uthmani,en.sahih`)
      .then(r => r.json())
      .then(data => {
        const editions = data.data || []
        const arEdition = editions.find(e => e.edition?.identifier === 'quran-uthmani')
        const enEdition = editions.find(e => e.edition?.identifier === 'en.sahih')
        if (arEdition) {
          setArabicAyahs(arEdition.ayahs || [])
          setSurahMeta({ name: arEdition.name, englishName: arEdition.englishName, englishNameTranslation: arEdition.englishNameTranslation })
        }
        if (enEdition) setTransAyahs(enEdition.ayahs || [])
        setLoadingAyahs(false)
        // Scroll to top of verses
        if (versesRef.current) versesRef.current.scrollTop = 0
      })
      .catch(() => { setError('ayahs'); setLoadingAyahs(false) })
  }, [selectedSurah, expanded])

  const surahLabel = (s) =>
    isAr
      ? `${s.number}. ${s.name}`
      : `${s.number}. ${s.englishName} — ${s.englishNameTranslation}`

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
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          background: 'transparent',
          border: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: 'pointer',
          textAlign: isAr ? 'right' : 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📖</span>
          <span style={{
            fontSize: '0.85rem', fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {t('quranTitle')}
          </span>
          {surahMeta && expanded && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--gold)',
              background: 'var(--gold-dim)',
              border: '1px solid rgba(212,175,106,0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '0.1rem 0.55rem',
              fontFamily: 'var(--font-arabic)',
            }}>
              {surahMeta.name}
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
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Controls bar */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}>
              {/* Surah selector */}
              {loadingSurahs ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                  {t('quranLoading')}
                </div>
              ) : (
                <select
                  value={selectedSurah}
                  onChange={e => setSelectedSurah(Number(e.target.value))}
                  style={{
                    flex: 1,
                    minWidth: 200,
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
                      {surahLabel(s)}
                    </option>
                  ))}
                </select>
              )}

              {/* Translation toggle */}
              <button
                onClick={() => setShowTrans(v => !v)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${showTrans ? 'rgba(96,165,250,0.4)' : 'var(--border)'}`,
                  background: showTrans ? 'var(--sapphire-dim)' : 'transparent',
                  color: showTrans ? 'var(--sapphire)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  flexShrink: 0,
                }}
              >
                {t('quranTranslation')}
              </button>

              {/* Surah meta */}
              {surahMeta && !isAr && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {surahMeta.englishNameTranslation}
                </span>
              )}
            </div>

            {/* Verses container */}
            <div
              ref={versesRef}
              style={{ maxHeight: 520, overflowY: 'auto', padding: '0 0 0.5rem' }}
            >
              {loadingAyahs ? (
                <div style={{
                  padding: '3rem 1.25rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                }}>
                  <div style={{
                    width: 28, height: 28,
                    border: '2px solid var(--border)',
                    borderTop: '2px solid var(--gold)',
                    borderRadius: '50%',
                    animation: 'quran-spin 0.8s linear infinite',
                    margin: '0 auto 0.75rem',
                  }} />
                  {t('quranLoading')}
                </div>
              ) : error === 'ayahs' ? (
                <div style={{ padding: '2rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--ruby)', fontSize: '0.85rem', marginBottom: '0.75rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
                    {t('quranError')}
                  </div>
                  <button
                    onClick={() => setSelectedSurah(s => s)}
                    style={{
                      fontSize: '0.8rem', color: 'var(--gold)',
                      border: '1px solid rgba(212,175,106,0.3)',
                      background: 'var(--gold-dim)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.35rem 0.8rem',
                      cursor: 'pointer',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                    }}
                  >
                    {t('quranRetry')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Bismillah (not for surah 1 since it's the first ayah, not for surah 9) */}
                  {selectedSurah !== 1 && selectedSurah !== NO_BISMILLAH && (
                    <div style={{
                      padding: '1.25rem 1.25rem 0.5rem',
                      textAlign: 'center',
                      fontFamily: 'var(--font-arabic)',
                      fontSize: '1.3rem',
                      color: 'var(--gold)',
                      direction: 'rtl',
                      lineHeight: 2,
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '0.25rem',
                    }}>
                      {t('quranBismillah')}
                    </div>
                  )}

                  {arabicAyahs.map((ayah, i) => (
                    <motion.div
                      key={ayah.numberInSurah}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.3) }}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Ayah number */}
                      <div style={{
                        flexShrink: 0,
                        width: 30, height: 30,
                        borderRadius: '50%',
                        border: '1px solid var(--border)',
                        background: 'var(--gold-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.68rem',
                        color: 'var(--gold)',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        marginTop: '0.2rem',
                        order: isAr ? 1 : 0,
                      }}>
                        {ayah.numberInSurah}
                      </div>

                      <div style={{ flex: 1, order: isAr ? 0 : 1 }}>
                        {/* Arabic text */}
                        <div style={{
                          fontFamily: 'var(--font-arabic)',
                          fontSize: '1.35rem',
                          lineHeight: 2.1,
                          color: 'var(--text-primary)',
                          direction: 'rtl',
                          textAlign: 'right',
                          marginBottom: showTrans ? '0.6rem' : 0,
                        }}>
                          {ayah.text}
                        </div>

                        {/* Translation */}
                        {showTrans && transAyahs[i] && (
                          <div style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.7,
                            direction: 'ltr',
                            textAlign: isAr ? 'right' : 'left',
                            fontStyle: 'italic',
                            borderTop: '1px solid var(--border)',
                            paddingTop: '0.45rem',
                            direction: isAr ? 'ltr' : 'ltr',
                          }}>
                            {transAyahs[i].text}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes quran-spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
