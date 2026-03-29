import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'
import { requireAuth } from '@/lib/middleware/RequireRole'

const GET_MY_INTERNS = `
  query GetMyInterns($user_id: uuid!) {
    interns(
      where: { user_id: { _eq: $user_id } }
      order_by: { created_at: desc }
    ) {
      id
      status
      start_date
      end_date
      college
      position_title
      cgpa
      city
      skills
      languages
      experience_level
      created_at
      userByUserId { id name email }
      department   { id name }
      user         { id name }
    }
  }
`

export async function GET(req) {
  // Allow all roles — intern, mentor, admin, hr can all call this
  // but it always returns records filtered to the logged-in user only
  const session = await requireAuth(req, ['admin', 'hr', 'mentor', 'intern'])
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await gqlFetch(GET_MY_INTERNS, { user_id: session.user.id })
    return NextResponse.json({ interns: data?.interns ?? [] })
  } catch (error) {
    console.error('[interns/my-profile GET]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}