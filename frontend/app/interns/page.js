'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { gqlFetch } from '@/lib/graphql-client'

const GET_INTERNS = `
  query GetInterns {
    interns(order_by: { created_at: desc }) {
      id status start_date end_date college position_title created_at
      user       { name email }
      department { name }
      mentor     { name }
    }
  }
`

export default function InternsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    gqlFetch(GET_INTERNS)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const interns = data?.interns ?? []
  const filtered = interns.filter(i => {
    const matchSearch =
      i.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.department?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || i.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Interns</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {loading ? '—' : `${interns.length} total interns`}
          </p>
        </div>
        <Link href="/interns/new" className="btn-primary">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Intern
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ maxWidth: '280px' }}
          placeholder="Search by name, email, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {['all', 'active', 'completed', 'terminated'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-body)',
            borderColor: filterStatus === s ? 'var(--accent)' : 'var(--border)',
            background: filterStatus === s ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: filterStatus === s ? 'var(--accent-light)' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', color: '#fca5a5', fontSize: '13px' }}>
          Failed to fetch interns. Check Hasura connection.
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Intern', 'Department', 'Mentor', 'Position', 'Start Date', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '13px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3,4,5].map(i => (
                <tr key={i}>
                  {[1,2,3,4,5,6,7].map(j => (
                    <td key={j} style={{ padding: '14px 20px' }}>
                      <div className="skeleton" style={{ height: '14px', width: j === 1 ? '140px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
              : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                      {search || filterStatus !== 'all' ? 'No interns match your filters.' : 'No interns yet.'}
                    </td>
                  </tr>
                )
                : filtered.map((intern, idx) => (
                  <tr key={intern.id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#fff', flexShrink: 0 }}>
                          {intern.user?.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{intern.user?.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{intern.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.department?.name ?? '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.mentor?.name ?? '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{intern.position_title ?? '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {intern.start_date ? new Date(intern.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge badge-${intern.status}`}>{intern.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Link href={`/interns/${intern.id}`} className="btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }}>View</Link>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}