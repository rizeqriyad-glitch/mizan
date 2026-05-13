import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'

function SettingRow({ label, description, children, isAr }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid var(--border)',
      gap: '1rem',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '0.2rem',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function ToggleGroup({ options, value, onChange, color = 'var(--gold)', colorDim = 'var(--gold-dim)' }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-input)',
      borderRadius: 'var(--radius-md)',
      padding: '3px',
      gap: '3px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '0.35rem 0.9rem',
            borderRadius: 'calc(var(--radius-md) - 2px)',
            border: 'none',
            background: value === opt.value ? 'var(--bg-card)' : 'transparent',
            color: value === opt.value ? color : 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: value === opt.value ? 500 : 400,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { language, changeLanguage, theme, changeTheme, timeFormat, changeTimeFormat, t } = useApp()
  const navigate = useNavigate()
  const isAr = language === 'ar'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 720,
      direction: isAr ? 'rtl' : 'ltr',
    }}
    className="settings-padding"
    >
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-display)',
          fontSize: isAr ? '2rem' : '2.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.35rem',
        }}>
          {t('settings')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: isAr ? 'var(--font-arabic)' : 'inherit' }}>
          {isAr ? 'تخصيص تجربتك في ميزان' : 'Customize your Mizan experience'}
        </p>
      </motion.div>

      {/* Account section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'الحساب' : 'Account'}
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--gold-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gold)', fontWeight: 600,
            }}>
              {user?.displayName?.[0]}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              {user?.displayName}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--emerald-dim)',
              border: '1px solid rgba(74,222,128,0.2)',
              color: 'var(--emerald)',
              fontSize: '0.72rem',
            }}>
              Google
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'التفضيلات' : 'Preferences'}
        </div>

        <SettingRow
          label={t('language')}
          description={isAr ? 'اختر لغة التطبيق' : 'Choose your app language'}
          isAr={isAr}
        >
          <ToggleGroup
            options={[
              { value: 'en', label: 'English' },
              { value: 'ar', label: 'العربية' },
            ]}
            value={language}
            onChange={changeLanguage}
          />
        </SettingRow>

        <SettingRow
          label={t('theme')}
          description={isAr ? 'مظهر التطبيق' : 'Application appearance'}
          isAr={isAr}
        >
          <ToggleGroup
            options={[
              { value: 'dark', label: isAr ? '🌙 داكن' : '🌙 Dark' },
              { value: 'light', label: isAr ? '☀️ فاتح' : '☀️ Light' },
            ]}
            value={theme}
            onChange={changeTheme}
          />
        </SettingRow>

        <SettingRow
          label={t('timeFormat')}
          description={isAr ? 'صيغة عرض الوقت' : 'How times are displayed'}
          isAr={isAr}
          style={{ borderBottom: 'none' }}
        >
          <ToggleGroup
            options={[
              { value: '12h', label: '12h' },
              { value: '24h', label: '24h' },
            ]}
            value={timeFormat}
            onChange={changeTimeFormat}
          />
        </SettingRow>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          About
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              width: 44, height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--gold-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
            }}>
              ⚖️
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 600 }}>
                Mizan — ميزان
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Version 1.0.0</div>
            </div>
          </div>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}>
            {isAr
              ? 'ميزان هو منصة إنتاجية إسلامية متكاملة تساعدك على تنظيم يومك حول الصلوات الخمس، القرآن الكريم، والأذكار. تم بناؤها بمحبة لدعم مسيرتك نحو التوازن والنجاح.'
              : 'Mizan is a premium Islamic productivity platform that helps you organize your day around the 5 daily prayers, Quran, and Adhkar. Built with care to support your journey toward balance and success.'
            }
          </p>
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(248,113,113,0.2)',
            background: 'var(--ruby-dim)',
            color: 'var(--ruby)',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--ruby-dim)'}
        >
          {t('signOut')}
        </button>
      </motion.div>

      <style>{`
        @media (max-width: 600px) {
          .settings-padding { padding: 1rem !important; }
        }
      `}</style>
    </div>
  )
}
