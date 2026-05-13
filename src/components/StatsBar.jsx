import { motion } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

export default function StatsBar() {
  const { stats, tasks, language, t, prayersDone } = useApp()
  const isAr = language === 'ar'

  // Compute today's productivity score
  const allTasks = Object.values(tasks).flat()
  const totalTasks = allTasks.length
  const doneTasks  = allTasks.filter(t => t.completed).length
  const score = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const statCards = [
    {
      icon: '🔥',
      value: stats.streak || 0,
      label: t('streak'),
      color: 'var(--amber)',
      dim: 'var(--amber-dim)',
    },
    {
      icon: '⭐',
      value: stats.points || 0,
      label: t('points'),
      color: 'var(--gold)',
      dim: 'var(--gold-dim)',
    },
    {
      icon: '🕌',
      value: `${prayersDone}/7`,
      label: t('prayersDone'),
      color: 'var(--sapphire)',
      dim: 'var(--sapphire-dim)',
    },
    {
      icon: '📊',
      value: `${score}%`,
      label: t('productivity'),
      color: score >= 70 ? 'var(--emerald)' : score >= 40 ? 'var(--amber)' : 'var(--ruby)',
      dim: score >= 70 ? 'var(--emerald-dim)' : score >= 40 ? 'var(--amber-dim)' : 'var(--ruby-dim)',
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
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
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
              background: card.dim,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
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
