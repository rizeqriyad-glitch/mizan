import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import Mizan3DScene from '../components/Mizan3DScene'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export default function DayHistoryPage() {
  const { user } = useAuth()
  const { language, t } = useApp()
  const isAr = language === 'ar'

  const [selectedDate, setSelectedDate] = useState(getTodayKey())
  const [completedItems, setCompletedItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCompletedItems = useCallback(async (date) => {
    if (!user) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'users', user.uid, 'completed'),
        where('date', '==', date)
      )
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setCompletedItems(items)
    } catch (error) {
      console.error("Error fetching completed items for history:", error)
      setCompletedItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCompletedItems(selectedDate)
  }, [selectedDate, fetchCompletedItems])

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-primary)',
      direction: isAr ? 'rtl' : 'ltr',
      overflow: 'hidden',
    }}>
      <Mizan3DScene completedItems={completedItems} selectedDate={selectedDate} />

      <div style={{
        position: 'absolute',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'var(--v-glass-bg)',
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid var(--v-glass-border)',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-brand)',
          fontSize: '1.8rem',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          lineHeight: 1.1,
        }}>
          {t('dayHistoryTitle') || (isAr ? 'تاريخ اليوم' : 'Day History')}
        </h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={getTodayKey()}
          style={{
            padding: '0.05rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--mizan-purple)',
            background: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'var(--font-display)',
            cursor: 'pointer',
            outline: 'none',
            colorScheme: 'dark',
          }}
        />
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </motion.div>
        )}
      </div>
    </div>
  )
}