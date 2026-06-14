import { motion } from 'motion/react'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { glyph } from './glyphs'

export default function StatsBar() {
  const { stats, tasks, prayersDone } = useApp()
  const { language, t } = useI18n()
  const isAr = language === 'ar'

  // Compute today's productivity score
  const allTasks = Object.values(tasks).flat()
  const totalTasks = allTasks.length
  const doneTasks  = allTasks.filter(t => t.completed).length
  const score = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const statCards = [
    {
      icon: glyph('streak'),
      value: stats.streak || 0,
      label: t('streak'),
      color: 'var(--mizan-purple)',
      dim: 'rgba(164, 169, 193,0.1)',
    },
    {
      icon: glyph('points'),
      value: stats.points || 0,
      label: t('points'),
      color: 'var(--mizan-purple)',
      dim: 'rgba(164, 169, 193,0.1)',
    },
    {
      icon: glyph('mosque'),
      value: `${prayersDone}/5`,
      label: t('prayersDone'),
      color: 'var(--mizan-cyan)',
      dim: 'rgba(103, 112, 152,0.1)',
    },
    {
      icon: glyph('productivity'),
      value: `${score}%`,
      label: t('productivity'),
      color: score >= 70 ? 'var(--mizan-cyan)' : score >= 40 ? 'var(--mizan-purple)' : 'var(--ruby)', // Ruby is still used for low score, which is fine.
      dim: score >= 70 ? 'rgba(103, 112, 152,0.1)' : score >= 40 ? 'rgba(164, 169, 193,0.1)' : 'var(--ruby-dim)', // Ruby dim is fine.
      progress: score,
    },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.75rem',
      marginBottom: '1.5rem',
      direction: isAr ? 'rtl' : 'ltr',
    }}
    className="stats-grid"
    >
      {statCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          style={{
            // background: 'var(--bg-card)', // Handled by glass-card
            borderRadius: '16px', // Mizan token for large cards
            // border: '1px solid var(--border)', // Handled by glass-card
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Progress bar (for productivity card) */}
          {card.progress !== undefined && (
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0,
              height: 2,
              width: `${card.progress}%`,
              background: card.color,
              borderRadius: '0 2px 0 0',
              transition: 'width 0.5s ease',
            }} />
          )}

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}>
            <div style={{
              width: 32, height: 32,
              borderRadius: 'var(--radius-md)',
              background: card.dim, // This dim color is already rgba, so it will blend with glass-icon-mizan's gradient
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              color: card.color,
            }}>
              {card.icon}
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 600,
            color: card.color,
            lineHeight: 1,
            marginBottom: '0.3rem',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {card.label}
          </div>
        </motion.div>
      ))}

      <style>{`
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
