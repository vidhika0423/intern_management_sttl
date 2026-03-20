'use client'

import { useState, useEffect } from 'react'

const COLUMNS = [
  { key: 'todo',        label: 'To Do',      color: '#6b7280' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'in_review',   label: 'In Review',   color: '#3b82f6' },
  { key: 'done',        label: 'Done',        color: '#22c55e' },
]

function PriorityDot({ priority }) {
  const map = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: map[priority] || '#6b7280', flexShrink: 0 }} />
}

function TaskCard({ task }) {
  const overdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', transition: 'border-color 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-card-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <PriorityDot priority={task.priority} />
        <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4', flex: 1 }}>{task.title}</p>
      </div>
      {task.description && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.intern?.userByUserId?.name ?? 'Unassigned'}</span>
        {task.due_date && <span style={{ fontSize: '11px', color: overdue ? '#ef4444' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{overdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState('kanban')

  useEffect(() => {
    fetch('/api/tasks').then(res => res.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const tasks = data?.tasks ?? []
  const byStatus = col => tasks.filter(t => t.status === col)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{tasks.length} total tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['kanban', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', border: '1px solid', fontFamily: 'var(--font-body)', borderColor: view === v ? 'var(--accent)' : 'var(--border)', background: view === v ? 'rgba(99,102,241,0.12)' : 'transparent', color: view === v ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'start' }}>
          {COLUMNS.map(col => (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>{col.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '99px', padding: '1px 8px' }}>{loading ? '…' : byStatus(col.key).length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '80px' }}>
                {loading ? [1,2].map(i => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '10px' }} />)
                  : byStatus(col.key).length === 0
                    ? <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Empty</span></div>
                    : byStatus(col.key).map(task => <TaskCard key={task.id} task={task} />)
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Task', 'Assigned To', 'Priority', 'Due Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} style={{ padding: '14px 20px' }}><div className="skeleton" style={{ height: '14px' }} /></td>)}</tr>)
                : tasks.map((task, idx) => (
                  <tr key={task.id} style={{ borderBottom: idx < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><PriorityDot priority={task.priority} /><span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{task.title}</span></div></td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{task.intern?.userByUserId?.name ?? '—'}</td>
                    <td style={{ padding: '14px 20px' }}><span style={{ fontSize: '12px', color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e', fontWeight: '500' }}>{task.priority}</span></td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td style={{ padding: '14px 20px' }}><span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}