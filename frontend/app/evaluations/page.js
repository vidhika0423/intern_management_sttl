'use client'

import { useState, useEffect } from 'react'

function ScorePill({ score }) {
  const color = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color, flexShrink: 0 }}>{score}</div>
      <div style={{ flex: 1, height: '5px', background: 'var(--bg-input)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${score * 10}%`, height: '100%', background: color, borderRadius: '99px' }} />
      </div>
    </div>
  )
}

export default function EvaluationsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/evaluations')
      .then(res => res.text())
      .then(text => { if (text) setData(JSON.parse(text)) })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const evals = data?.evaluations ?? []
  const avg = evals.length ? (evals.reduce((s, e) => s + e.score, 0) / evals.length).toFixed(1) : '—'

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Evaluations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{evals.length} total · avg score {avg}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        {loading ? [1,2,3,4,5,6].map(i => <div key={i} className="skeleton card" style={{ height: '160px' }} />)
          : evals.length === 0
            ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No evaluations yet.</div>
            : evals.map(ev => (
              <div key={ev.id} className="card animate-fadeUp" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{ev.intern?.userByUserId?.name ?? '—'}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{ev.intern?.department?.name ?? '—'}</p>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '3px 8px', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}>
                    {ev.period ?? 'General'}
                  </span>
                </div>
                <ScorePill score={ev.score} />
                {ev.feedback && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {ev.feedback}
                  </p>
                )}
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
                  by {ev.user?.name ?? '—'} · {new Date(ev.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))
        }
      </div>
    </div>
  )
}