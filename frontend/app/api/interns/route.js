import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

const GET_INTERNS = `
  query GetInterns {
    interns(order_by: { created_at: desc }) {
      id status start_date end_date college position_title created_at
      userByUserId { name email }
      department   { name }
      user         { name }
    }
  }
`

export async function GET() {
  try {
    const data = await gqlFetch(GET_INTERNS)
    return NextResponse.json(data ?? { interns: [] })
  } catch (error) {
    console.error('Interns error:', error.message)
    return NextResponse.json({ interns: [] }, { status: 200 })
  }
}