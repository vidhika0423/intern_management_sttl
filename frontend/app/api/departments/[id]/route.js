import { gqlFetch } from "@/lib/graphql-client";
import { requireAuth } from "@/lib/middleware/RequireRole";
import { NextResponse } from "next/server";

const GET_DEPARTMENT_BY_ID = `
  query GetDepartmentById($id: uuid!) {
    departments_by_pk(id: $id) {
      id
      name
      description
      head_user_id
      created_at
      user {
        id
        name
        email
        role
      }
      interns_aggregate {
        aggregate { count }
      }
    }
  }
`;

export async function GET(request, context) {
  const session = await requireAuth(request, ["admin", "hr", "manager", "mentor"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 })
  }

  const params = await context.params;
  const id = params.id;

  try {
    const data = await gqlFetch(GET_DEPARTMENT_BY_ID, { id });
    const department = data?.departments_by_pk ?? null;

    if (!department) {
      return NextResponse.json({ error: "Department not found", ok: false }, { status: 404 });
    }

    return NextResponse.json(
      { ok: true, department },
      { status: 200 }
    );
  } catch (error) {
    console.error('Department fetch error:', error.message);
    return NextResponse.json({ error: error.message, ok: false }, { status: 500 });
  }
}