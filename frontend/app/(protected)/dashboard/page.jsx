'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { gqlFetch } from '@/lib/graphql-client'

const DASHBOARD_QUERY = `
  query DashboardStats {
    interns_aggregate { aggregate { count } }
    active: interns_aggregate(where: { status: { _eq: "active" } }) { aggregate { count } }
    tasks_aggregate { aggregate { count } }
    pending_tasks: tasks_aggregate(where: { status: { _neq: "done" } }) { aggregate { count } }
    departments_aggregate { aggregate { count } }
    recent_interns: interns(limit: 5, order_by: { created_at: desc }) {
      id status position_title
      user { name email }
      department { name }
    }
    recent_tasks: tasks(limit: 5, order_by: { created_at: desc }) {
      id title status priority
      intern { user { name } }
    }
  }
`

function StatCard({ label, value, sub, accent, loading }) {
  if (loading) return (
    <div className="card" style={{ padding: '24px' }}>
      <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '50%', height: '10px' }} />
    </div>
  )
  return (
    <div className="card animate-fadeUp" style={{ padding: '24px' }}>
      <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '700', color: accent || 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    gqlFetch(DASHBOARD_QUERY)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const totalInterns  = data?.interns_aggregate?.aggregate?.count ?? 0
  const activeInterns = data?.active?.aggregate?.count ?? 0
  const totalTasks    = data?.tasks_aggregate?.aggregate?.count ?? 0
  const pendingTasks  = data?.pending_tasks?.aggregate?.count ?? 0
  const depts         = data?.departments_aggregate?.aggregate?.count ?? 0

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>Welcome back — here's what's happening today.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', color: '#fca5a5', fontSize: '13px' }}>
          ⚠ Could not connect to Hasura. Check your .env.local and make sure Docker is running.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
        <StatCard label="Total Interns"  value={totalInterns}  sub={`${activeInterns} currently active`} loading={loading} />
        <StatCard label="Active Interns" value={activeInterns} accent="var(--status-active)" loading={loading} />
        <StatCard label="Total Tasks"    value={totalTasks}    sub={`${pendingTasks} pending`} loading={loading} />
        <StatCard label="Departments"    value={depts}         loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600' }}>Recent Interns</h2>
            <Link href="/interns" style={{ fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '42px' }} />)
              : data?.recent_interns?.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No interns yet.</p>
                : data?.recent_interns?.map(intern => (
                  <Link key={intern.id} href={`/interns/${intern.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                      {intern.user?.name?.[0] ?? '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{intern.user?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{intern.department?.name ?? 'No dept'} · {intern.position_title ?? '—'}</p>
                    </div>
                    <span className={`badge badge-${intern.status}`}>{intern.status}</span>
                  </Link>
                ))
            }
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '600' }}>Recent Tasks</h2>
            <Link href="/tasks" style={{ fontSize: '12px', color: 'var(--accent-light)', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '42px' }} />)
              : data?.recent_tasks?.length === 0
                ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No tasks yet.</p>
                : data?.recent_tasks?.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e', flexShrink: 0, display: 'inline-block' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.intern?.user?.name ?? '—'}</p>
                    </div>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}