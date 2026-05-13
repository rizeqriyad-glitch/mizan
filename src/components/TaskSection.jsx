import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useApp } from '../contexts/AppContext'
import { startRadarAlarm, unlockAlarm } from '../utils/alarmSound'

function fmtTimer(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function TaskSection({ section, isFixed = false }) {
  const { tasks, addTask, editTask, deleteTask, toggleTask, reorderTasks, language, t } = useApp()
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskDuration, setNewTaskDuration] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [activeTimer, setActiveTimer] = useState(null) // { taskId, taskText, totalSeconds, secondsLeft }
  const [timerAlert, setTimerAlert] = useState(null)   // string: task text
  const inputRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const activeTimerRef   = useRef(null)
  const alarmStopRef     = useRef(null)  // fn returned by startRadarAlarm
  const alarmTimerRef    = useRef(null)  // auto-stop timeout
  const isAr = language === 'ar'

  const sectionTasks = (tasks[section.id] || [])
  const pendingTasks = sectionTasks.filter(t => !t.completed)
  const doneTasks    = sectionTasks.filter(t => t.completed)
  const label = section.label?.[language] || section.label?.en || section.id

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (alarmStopRef.current)     alarmStopRef.current()
    if (alarmTimerRef.current)    clearTimeout(alarmTimerRef.current)
  }, [])

  const triggerAlarm = (taskText) => {
    if (alarmStopRef.current) alarmStopRef.current()
    clearTimeout(alarmTimerRef.current)
    alarmStopRef.current = startRadarAlarm(8)
    setTimerAlert(taskText)
    // Auto-dismiss after 3 s (alarm duration)
    alarmTimerRef.current = setTimeout(() => {
      alarmStopRef.current = null
      setTimerAlert(null)
    }, 3000)
  }

  const dismissAlarm = () => {
    if (alarmStopRef.current) { alarmStopRef.current(); alarmStopRef.current = null }
    clearTimeout(alarmTimerRef.current)
    alarmTimerRef.current = null
    setTimerAlert(null)
  }

  const startTimer = (task) => {
    if (!task.duration || task.duration <= 0) return
    unlockAlarm() // pre-load audio during user gesture
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    const totalSecs = task.duration * 60
    const data = { taskId: task.id, taskText: task.text, totalSeconds: totalSecs, secondsLeft: totalSecs }
    activeTimerRef.current = data
    setActiveTimer(data)

    timerIntervalRef.current = setInterval(() => {
      if (!activeTimerRef.current) return
      const next = activeTimerRef.current.secondsLeft - 1
      if (next <= 0) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
        const text = activeTimerRef.current.taskText
        activeTimerRef.current = null
        setActiveTimer(null)
        triggerAlarm(text)
      } else {
        activeTimerRef.current = { ...activeTimerRef.current, secondsLeft: next }
        setActiveTimer({ ...activeTimerRef.current })
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    timerIntervalRef.current = null
    activeTimerRef.current = null
    setActiveTimer(null)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const dur = newTaskDuration ? parseInt(newTaskDuration, 10) : null
    await addTask(section.id, newTaskText, dur && dur > 0 ? dur : null)
    setNewTaskText('')
    setNewTaskDuration('')
    setIsAdding(false)
  }

  const handleStartEdit = (task) => {
    setEditingId(task.id)
    setEditText(task.text)
  }

  const handleSaveEdit = async (taskId) => {
    if (editText.trim()) await editTask(taskId, editText.trim())
    setEditingId(null)
    setEditText('')
  }

  const handleKeyDown = (e, handler) => {
    if (e.key === 'Enter') handler()
    if (e.key === 'Escape') { setEditingId(null); setIsAdding(false) }
  }

  const typeColor = section.type === 'prayer' ? 'var(--gold)' :
                    section.type === 'worship' ? 'var(--sapphire)' : 'var(--emerald)'

  const typeDim = section.type === 'prayer' ? 'var(--gold-dim)' :
                  section.type === 'worship' ? 'var(--sapphire-dim)' : 'var(--emerald-dim)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: '0.75rem',
      }}
    >
      {/* Section Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          cursor: 'pointer',
          userSelect: 'none',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          transition: 'background var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: 32, height: 32,
            borderRadius: 'var(--radius-md)',
            background: typeDim,
            border: `1px solid ${typeColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0,
          }}>
            {section.icon}
          </span>
          <div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            }}>
              {label}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {pendingTasks.length} {isAr ? 'معلقة' : 'pending'} · {doneTasks.length} {isAr ? 'مكتملة' : 'done'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {sectionTasks.length > 0 && (
            <div style={{
              fontSize: '0.7rem',
              color: typeColor,
              background: typeDim,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
            }}>
              {Math.round((doneTasks.length / sectionTasks.length) * 100)}%
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setIsAdding(true); setExpanded(true) }}
            style={{
              width: 26, height: 26,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', lineHeight: 1,
              transition: 'all var(--transition)',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = typeColor; e.currentTarget.style.color = typeColor }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            +
          </button>
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition)',
            display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* Tasks body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Timer alert banner */}
            <AnimatePresence>
              {timerAlert && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'var(--emerald-dim)',
                    borderBottom: '1px solid rgba(74,222,128,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--emerald)',
                    fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                  }}
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.54 }}
                  >
                    ⏰
                  </motion.span>
                  <span style={{ flex: 1 }}>
                    {t('timesUp')}
                    {timerAlert ? ` — "${timerAlert}"` : ''}
                  </span>
                  <button
                    onClick={dismissAlarm}
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(74,222,128,0.4)',
                      background: 'rgba(74,222,128,0.12)',
                      color: 'var(--emerald)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      flexShrink: 0,
                    }}
                  >
                    {isAr ? 'إيقاف' : 'Stop'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {pendingTasks.length === 0 && !isAdding ? (
              <div style={{
                padding: '1.25rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
              }}>
                {t('noTasksYet')}
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={pendingTasks}
                onReorder={(newOrder) => reorderTasks(section.id, newOrder)}
                style={{ listStyle: 'none', padding: 0 }}
              >
                {pendingTasks.map((task) => (
                  <Reorder.Item key={task.id} value={task} style={{ listStyle: 'none' }}>
                    <TaskItem
                      task={task}
                      editingId={editingId}
                      editText={editText}
                      setEditText={setEditText}
                      onToggle={() => toggleTask(task)}
                      onEdit={() => handleStartEdit(task)}
                      onSaveEdit={() => handleSaveEdit(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleSaveEdit(task.id))}
                      typeColor={typeColor}
                      isAr={isAr}
                      t={t}
                      isTimerActive={activeTimer?.taskId === task.id}
                      timerSeconds={activeTimer?.taskId === task.id ? activeTimer.secondsLeft : 0}
                      timerTotal={activeTimer?.taskId === task.id ? activeTimer.totalSeconds : (task.duration ? task.duration * 60 : 0)}
                      onStartTimer={() => startTimer(task)}
                      onStopTimer={stopTimer}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {doneTasks.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '0.25rem 0' }}>
                {doneTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    editingId={editingId}
                    editText={editText}
                    setEditText={setEditText}
                    onToggle={() => toggleTask(task)}
                    onEdit={() => handleStartEdit(task)}
                    onSaveEdit={() => handleSaveEdit(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleSaveEdit(task.id))}
                    typeColor={typeColor}
                    isAr={isAr}
                    t={t}
                    isTimerActive={false}
                    timerSeconds={0}
                    timerTotal={0}
                    onStartTimer={() => {}}
                    onStopTimer={() => {}}
                  />
                ))}
              </div>
            )}

            {/* Add task form */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.25rem' }}
                >
                  <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* Main row */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        ref={inputRef}
                        autoFocus
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') setIsAdding(false) }}
                        placeholder={t('addTask')}
                        style={{
                          flex: 1,
                          background: 'var(--bg-input)',
                          border: `1px solid ${typeColor}40`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          direction: isAr ? 'rtl' : 'ltr',
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: typeDim,
                          border: `1px solid ${typeColor}40`,
                          color: typeColor,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {t('save')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAdding(false); setNewTaskDuration('') }}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Duration row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      direction: isAr ? 'rtl' : 'ltr',
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      }}>
                        ⏱ {t('durationLabel')}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="480"
                        value={newTaskDuration}
                        onChange={e => setNewTaskDuration(e.target.value)}
                        placeholder={isAr ? '—' : '—'}
                        style={{
                          width: 60,
                          background: 'var(--bg-input)',
                          border: `1px solid ${typeColor}30`,
                          borderRadius: 'var(--radius-md)',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          textAlign: 'center',
                        }}
                      />
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
                      }}>
                        {isAr ? 'دقيقة' : 'minutes'}
                      </span>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TaskItem({
  task, editingId, editText, setEditText,
  onToggle, onEdit, onSaveEdit, onDelete, onKeyDown,
  typeColor, isAr, t,
  isTimerActive, timerSeconds, timerTotal, onStartTimer, onStopTimer,
}) {
  const isEditing = editingId === task.id
  const [hovered, setHovered] = useState(false)

  const timerProgress = timerTotal > 0 ? 1 - (timerSeconds / timerTotal) : 0
  const circumference = 2 * Math.PI * 9
  const hasDuration = task.duration && task.duration > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: isAr ? 8 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isAr ? 8 : -8 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 1.25rem',
        background: hovered ? 'var(--bg-card-hover)' : 'transparent',
        transition: 'background var(--transition)',
        cursor: 'default',
      }}
    >
      {/* Drag handle */}
      {!task.completed && (
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '0.7rem',
          cursor: 'grab',
          opacity: hovered ? 0.6 : 0,
          transition: 'opacity var(--transition)',
          userSelect: 'none',
          flexShrink: 0,
        }}>
          ⋮⋮
        </span>
      )}

      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: 20, height: 20, flexShrink: 0,
          borderRadius: 'var(--radius-sm)',
          border: task.completed ? `1.5px solid ${typeColor}` : '1.5px solid var(--border-strong)',
          background: task.completed ? typeColor : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition)',
        }}
      >
        {task.completed && (
          <svg width="11" height="11" viewBox="0 0 12 12">
            <polyline
              points="2,6 5,9 10,3"
              fill="none"
              stroke={task.type === 'prayer' ? '#0a0a0f' : 'white'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Task text or edit input */}
      {isEditing ? (
        <input
          autoFocus
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={onKeyDown}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: `1px solid ${typeColor}40`,
            borderRadius: 'var(--radius-sm)',
            padding: '0.25rem 0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            direction: isAr ? 'rtl' : 'ltr',
          }}
        />
      ) : (
        <span
          onDoubleClick={onEdit}
          style={{
            flex: 1,
            fontSize: '0.875rem',
            color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.completed ? 'line-through' : 'none',
            fontFamily: isAr ? 'var(--font-arabic)' : 'inherit',
            cursor: 'text',
            userSelect: 'text',
          }}
        >
          {task.text}
        </span>
      )}

      {/* Timer control (only for tasks with duration, not completed) */}
      {hasDuration && !task.completed && (
        <button
          onClick={isTimerActive ? onStopTimer : onStartTimer}
          title={isTimerActive ? t('stopTask') : t('startTask')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            border: isTimerActive
              ? `1px solid ${typeColor}60`
              : '1px solid var(--border-strong)',
            background: isTimerActive ? typeColor + '22' : 'transparent',
            color: isTimerActive ? typeColor : 'var(--text-muted)',
            fontSize: '0.72rem',
            fontVariantNumeric: 'tabular-nums',
            cursor: 'pointer',
            transition: 'all var(--transition)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            if (!isTimerActive) {
              e.currentTarget.style.borderColor = typeColor
              e.currentTarget.style.color = typeColor
            }
          }}
          onMouseLeave={e => {
            if (!isTimerActive) {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }
          }}
        >
          {isTimerActive ? (
            <>
              {/* Mini circular progress */}
              <svg width="18" height="18" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                <circle cx="9" cy="9" r="9" fill="none" stroke="var(--border)" strokeWidth="2" />
                <circle
                  cx="9" cy="9" r="9"
                  fill="none"
                  stroke={typeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - timerProgress)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <span>{fmtTimer(timerSeconds)}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>■</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>{task.duration}{isAr ? 'د' : 'm'}</span>
            </>
          )}
        </button>
      )}

      {/* Edit / Delete */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        opacity: hovered ? 1 : 0,
        transition: 'opacity var(--transition)',
      }}>
        <button
          onClick={onEdit}
          title={t('editTask')}
          style={{
            width: 24, height: 24,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          ✎
        </button>
        <button
          onClick={onDelete}
          title={t('deleteTask')}
          style={{
            width: 24, height: 24,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ruby)'; e.currentTarget.style.color = 'var(--ruby)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}
