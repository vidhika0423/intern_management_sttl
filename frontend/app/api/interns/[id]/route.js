import { NextResponse } from 'next/server'
import { gqlFetch } from '@/lib/graphql-client'

//update the query 
const GET_INTERN = `
query GetIntern($id: uuid!) {
    interns(where: {user_id: {_eq: $id}}) {
    college
    department {
      name
      departmentHead {
        name
        email
      }
    }
    evaluations {
      feedback
      period
      score
    }
    tasks {
      assigned_by
      description
      due_date
      priority
      status
      title
    }
  }
}`

export async function GET(request, context) {
  const { id } = await context.params;
  
  try {
    const data = await gqlFetch(GET_INTERN, { id })
    return NextResponse.json(data ?? {})
  } catch (error) {
    console.error('Intern detail error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 200 })
  }
}