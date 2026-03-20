import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

const GET_EVALUATIONS = `
  query GetEvaluations {
    evaluations(order_by: { created_at: desc }) {
      id score feedback period created_at
      intern {
        userByUserId { name }
        department   { name }
      }
      user { name }
    }
  }
`

export async function GET() {
  try {
    const data = await gqlFetch(GET_EVALUATIONS)
    return NextResponse.json(data ?? { evaluations: [] })
  } catch (error) {
    console.error('Evaluations error:', error.message)
    return NextResponse.json({ evaluations: [] }, { status: 200 })
  }
}