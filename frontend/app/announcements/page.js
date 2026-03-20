'use client'

import { useState, useEffect } from 'react'

const AUDIENCE_STYLE = {
  all:           { label: 'Everyone',     color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  interns_only:  { label: 'Interns Only', color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
  mentors_only:  { label: 'Mentors Only', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AnnouncementsPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/announcements').then(res => res.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const items = data?.announcements ?? []

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>Announcements</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{items.length} announcements</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '760px' }}>
        {loading ? [1,2,3].map(i => <div key={i} className="skeleton card" style={{ height: '100px' }} />)
          : items.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>No announcements yet.</div>
            : items.map(item => {
              const aud = AUDIENCE_STYLE[item.audience] || AUDIENCE_STYLE.all
              return (
                <div key={item.id} className="card animate-fadeUp" style={{ padding: '22px 26px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</h2>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: aud.bg, color: aud.color, flexShrink: 0, marginLeft: '12px' }}>{aud.label}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '14px' }}>{item.body}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posted by <span style={{ color: 'var(--text-secondary)' }}>{item.user?.name ?? 'Admin'}</span> · {timeAgo(item.created_at)}</p>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}