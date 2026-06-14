import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { glyph } from '../components/glyphs'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import { useI18n } from '../contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { saveAlarmFile, clearAlarmFile } from '../utils/alarmStorage'
import { setCustomAlarm, clearCustomAlarm, getCustomAlarmName } from '../utils/alarmSound'

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

function ToggleGroup({ options, value, onChange, accentColor = 'var(--mizan-purple)' }) {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '3px',
      gap: '2px',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '0.35rem 0.9rem',
            borderRadius: '8px',
            border: 'none',
            background: value === opt.value ? accentColor : 'transparent',
            color: value === opt.value ? 'white' : 'var(--text-secondary)',
            fontSize: '0.8rem',
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

function AlarmUploader({ isAr }) {
  const [fileName, setFileName] = useState(getCustomAlarmName)
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const buffer = await file.arrayBuffer()
      await saveAlarmFile(buffer, file.name)
      const blob = new Blob([buffer], { type: file.type || 'audio/mpeg' })
      const url  = URL.createObjectURL(blob)
      setCustomAlarm(url, file.name)
      setFileName(file.name)
    } catch {}
    e.target.value = ''
  }

  const handleRemove = async () => {
    await clearAlarmFile()
    clearCustomAlarm()
    setFileName(null)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{
        fontSize: '0.78rem',
        color: fileName ? 'var(--emerald)' : 'var(--text-muted)',
        maxWidth: 170,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
      }}>
        {fileName ? fileName : (isAr ? 'افتراضي (رادار)' : 'Default (Radar)')}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.ogg,.m4a,audio/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => inputRef.current?.click()}
        style={{
          padding: '0.35rem 0.8rem',
          borderRadius: '10px',
          border: '1px solid var(--v-glass-border)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '0.78rem',
          cursor: 'pointer',
          transition: 'all var(--transition)',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mizan-purple)'; e.currentTarget.style.color = 'var(--mizan-purple)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--v-glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        {glyph('upload', 13)} {isAr ? 'رفع ملف' : 'Upload'}
      </button>

      {fileName && (
        <button
          onClick={handleRemove}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid var(--v-glass-border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mizan-cyan)'; e.currentTarget.style.color = 'var(--mizan-cyan)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--v-glass-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          {isAr ? 'حذف' : 'Remove'}
        </button>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { timeFormat, changeTimeFormat, prayerNotifications, changePrayerNotifications } = useApp()
  const { language, changeLanguage, t } = useI18n()
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
        className="glass-card"
        style={{
          borderRadius: '16px',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
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
            <div className="glass-icon-mizan" style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(164, 169, 193,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--mizan-purple)', fontWeight: 600,
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
              borderRadius: '9999px', // Mizan token for full-pill
              background: 'rgba(103, 112, 152,0.1)',
              border: '1px solid rgba(103, 112, 152,0.2)',
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
        className="glass-card"
        style={{
          borderRadius: '16px',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
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
            accentColor="var(--mizan-purple)"
          />
        </SettingRow>

        <SettingRow
          label={t('timeFormat')}
          description={isAr ? 'صيغة عرض الوقت' : 'How times are displayed'}
          isAr={isAr}
        >
          <ToggleGroup
            options={[
              { value: '12h', label: '12h' },
              { value: '24h', label: '24h' },
            ]}
            value={timeFormat}
            onChange={changeTimeFormat}
            accentColor="var(--mizan-purple)"
          />
        </SettingRow>

        <SettingRow
          label={t('prayerAlerts')}
          description={t('prayerAlertsDesc')}
          isAr={isAr}
        >
          <ToggleGroup
            options={[
              { value: true,  label: t('enabled')  },
              { value: false, label: t('disabled') },
            ]}
            value={prayerNotifications}
            onChange={changePrayerNotifications}
            accentColor="var(--mizan-cyan)"
          />
        </SettingRow>

      </motion.div>

      {/* Alarm Sound */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
        }}>
          {isAr ? 'صوت التنبيه' : 'Alarm Sound'}
        </div>

        <SettingRow
          label={isAr ? 'نغمة التنبيهات' : 'Notification tone'}
          description={isAr ? 'تُستخدم لجميع التذكيرات والمهام والجدول — ارفع ملفاً مخصصاً أو استخدم النغمة الافتراضية' : 'Used for all reminders, tasks & schedule alerts — upload a custom file or use the default tone'}
          isAr={isAr}
        >
          <AlarmUploader isAr={isAr} />
        </SettingRow>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{
          borderRadius: '16px',
          marginBottom: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.75rem',
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
              width: 48, height: 48,
              borderRadius: '14px',
              background: 'rgba(164, 169, 193,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              color: 'var(--primary)',
            }}>
              {glyph('scale')}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 600 }}>
                Mizan — ميزان
              </div> {/* This gold color will be updated to gradient-text later if it's a primary display. For now, it's fine as a secondary element. */}
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
            width: '100%', padding: '0.9rem',
            borderRadius: '12px',
            border: '1px solid var(--v-glass-border)',
            background: 'rgba(255,0,0,0.1)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: 'var(--v-shadow)',
            transition: 'all var(--transition)',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--v-glass-border)' }}
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
