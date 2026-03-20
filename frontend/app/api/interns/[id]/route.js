import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

const GET_INTERN = `
  query GetIntern($id: uuid!) {
    interns_by_pk(id: $id) {
      id status start_date end_date college position_title created_at
      userByUserId { name email }
      department   { name }
      user         { name email }
      tasks(order_by: { created_at: desc }) {
        id title status priority due_date description
      }
      attendances: attendance(order_by: { date: desc }, limit: 10) {
        id date check_in check_out status
      }
      evaluations(order_by: { created_at: desc }) {
        id score feedback period created_at
        user { name }
      }
      documents { id type file_url uploaded_at }
    }
  }
`

export async function GET(request, { params }) {
  try {
    const data = await gqlFetch(GET_INTERN, { id: params.id })
    return NextResponse.json(data ?? {})
  } catch (error) {
    console.error('Intern detail error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}