'use client'

import Link from 'next/link'

export default function NewInternPage() {
  return (
    <div style={{ maxWidth: '560px' }}>
      <Link href="/interns" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        ← Back to Interns
      </Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>Add New Intern</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
        This form will use GraphQL mutations — coming in Phase 3 (Authentication + Mutations).
      </p>
      <div className="card" style={{ padding: '32px', textAlign: 'center', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Mutation forms will be built after authentication is set up.<br />
          For now, insert data directly via pgAdmin or the Hasura console.
        </p>
      </div>
    </div>
  )
}