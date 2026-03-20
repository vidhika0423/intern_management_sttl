import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

const GET_ATTENDANCE = `
  query GetAttendance {
    attendance(order_by: { date: desc }) {
      id date check_in check_out status notes
      intern {
        userByUserId { name }
        department   { name }
      }
    }
  }
`

export async function GET() {
  try {
    const data = await gqlFetch(GET_ATTENDANCE)
    return NextResponse.json(data ?? { attendance: [] })
  } catch (error) {
    console.error('Attendance error:', error.message)
    return NextResponse.json({ attendance: [] }, { status: 200 })
  }
}