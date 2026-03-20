'use client'

import { useState, useEffect } from 'react'

const DEPT_COLORS = ['#6366f1','#22c55e','#f59e0b','#3b82f6','#ec4899','#14b8a6']

export default function DepartmentsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.text())
      .then(text => { if (text) setData(JSON.parse(text)) })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const depts = data?.departments ?? []

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Departments</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{depts.length} departments</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
        {loading ? [1,2,3,4,5,6].map(i => <div key={i} className="skeleton card" style={{ height: '140px' }} />)
          : depts.length === 0
            ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No departments yet.</div>
            : depts.map((dept, idx) => {
              const color = DEPT_COLORS[idx % DEPT_COLORS.length]
              const count = dept.interns_aggregate?.aggregate?.count ?? 0
              return (
                <div key={dept.id} className="card animate-fadeUp" style={{ padding: '24px', borderTop: `3px solid ${color}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color }}>{count}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>{dept.name}</h2>
                  {dept.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.5' }}>{dept.description}</p>}
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Head: <span style={{ color: 'var(--text-primary)' }}>{dept.user?.name ?? 'Not assigned'}</span>
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{count} intern{count !== 1 ? 's' : ''}</p>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}