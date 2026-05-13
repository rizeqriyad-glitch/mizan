import { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { useApp } from '../contexts/AppContext'

export default function TaskSection({ section, isFixed = false }) {
  const { tasks, addTask, editTask, deleteTask, toggleTask, reorderTasks, language, t } = useApp()
  const [newTaskText, setNewTaskText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const inputRef = useRef(null)
  const isAr = language === 'ar'

  const sectionTasks = (tasks[section.id] || [])
  const pendingTasks = sectionTasks.filter(t => !t.completed)
  const doneTasks    = sectionTasks.filter(t => t.completed)
  const label = section.label?.[language] || section.label?.en || section.id

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    await addTask(section.id, newTaskText)
    setNewTaskText('')
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
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
            }}>
              {pendingTasks.length} {isAr ? 'معلقة' : 'pending'} · {doneTasks.length} {isAr ? 'مكتملة' : 'done'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Progress pill */}
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

          {/* Add button */}
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

          {/* Expand chevron */}
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
            {/* Pending tasks with drag reorder */}
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
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}

            {/* Completed tasks */}
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
                  />
                ))}
              </div>
            )}

            {/* Add task input */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.25rem' }}
                >
                  <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem' }}>
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
                      onClick={() => setIsAdding(false)}
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

function TaskItem({ task, editingId, editText, setEditText, onToggle, onEdit, onSaveEdit, onDelete, onKeyDown, typeColor, isAr, t }) {
  const isEditing = editingId === task.id
  const [hovered, setHovered] = useState(false)

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

      {/* Action buttons */}
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
