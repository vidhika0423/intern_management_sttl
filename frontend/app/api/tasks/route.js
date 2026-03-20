import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

const GET_TASKS = `
  query GetTasks {
    tasks(order_by: { created_at: desc }) {
      id title description status priority due_date created_at
      intern { userByUserId { name } }
    }
  }
`

export async function GET() {
  try {
    const data = await gqlFetch(GET_TASKS)
    return NextResponse.json(data ?? { tasks: [] })
  } catch (error) {
    console.error('Tasks error:', error.message)
    return NextResponse.json({ tasks: [] }, { status: 200 })
  }
}