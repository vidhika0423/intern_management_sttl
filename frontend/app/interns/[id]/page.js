'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '18px' }}>{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>{value || '—'}</span>
    </div>
  )
}

function ScoreBar({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${score * 10}%`, height: '100%', background: score >= 8 ? 'var(--status-active)' : score >= 5 ? 'var(--status-progress)' : 'var(--status-terminated)', borderRadius: '99px' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', minWidth: '24px' }}>{score}/10</span>
    </div>
  )
}

export default function InternDetail() {
  const { id } = useParams()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    fetch(`/api/interns/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  const intern = data?.interns_by_pk

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{[1,2,3].map(i => <div key={i} className="skeleton card" style={{ height: '120px' }} />)}</div>
  if (error || !intern) return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠</p>
      <p>Intern not found.</p>
      <Link href="/interns" className="btn-ghost" style={{ marginTop: '20px', display: 'inline-flex' }}>← Back</Link>
    </div>
  )

  return (
    <div>
      <Link href="/interns" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>← Back to Interns</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
          {intern.userByUserId?.name?.[0] ?? '?'}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>{intern.userByUserId?.name}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{intern.position_title ?? 'Intern'} · {intern.department?.name ?? 'No department'}</p>
        </div>
        <span className={`badge badge-${intern.status}`} style={{ marginLeft: 'auto', fontSize: '12px', padding: '5px 14px' }}>{intern.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <Section title="Profile">
            <InfoRow label="Email"      value={intern.userByUserId?.email} />
            <InfoRow label="College"    value={intern.college} />
            <InfoRow label="Department" value={intern.department?.name} />
            <InfoRow label="Mentor"     value={intern.user?.name} />
            <InfoRow label="Start Date" value={intern.start_date ? new Date(intern.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
            <InfoRow label="End Date"   value={intern.end_date   ? new Date(intern.end_date).toLocaleDateString('en-IN',   { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
          </Section>
          <Section title="Evaluations">
            {intern.evaluations?.length === 0
              ? <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No evaluations yet.</p>
              : intern.evaluations?.map(ev => (
                <div key={ev.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{ev.period ?? 'Evaluation'}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {ev.user?.name ?? '—'}</span>
                  </div>
                  <ScoreBar score={ev.score} />
                  {ev.feedback && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>{ev.feedback}</p>}
                </div>
              ))
            }
          </Section>
        </div>
        <div>
          <Section title={`Tasks (${intern.tasks?.length ?? 0})`}>
            {intern.tasks?.length === 0
              ? <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks assigned.</p>
              : intern.tasks?.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</p>
                    {task.due_date && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>}
                  </div>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                </div>
              ))
            }
          </Section>
          <Section title="Recent Attendance">
            {intern.attendances?.length === 0
              ? <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No records.</p>
              : intern.attendances?.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {a.check_in && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.check_in} – {a.check_out ?? '?'}</span>}
                    <span className={`badge badge-${a.status}`}>{a.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            }
          </Section>
        </div>
      </div>
    </div>
  )
}