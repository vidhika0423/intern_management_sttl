// import { gqlFetch } from "@/lib/graphql-client";
// import { requireAuth } from "@/lib/middleware/RequireRole";
// import { NextResponse } from "next/server";

// const GET_DEPARTMENT_BY_ID = `
//   query GetDepartmentById($id: uuid!) {
//     departments_by_pk(id: $id) {
//       id
//       name
//       description
//       head_user_id
//       created_at
//       user {
//         id
//         name
//         email
//         role
//       }
//       interns_aggregate {
//         aggregate { count }
//       }
//     }
//   }
// `;
// // In departments/[id]/route.js (or a new route)
// const GET_DEPT_BY_MANAGER = `
//   query GetDeptByManager($userId: uuid!) {
//     departments(where: { head_user_id: { _eq: $userId } }) {
//       id
//       name
//       description
//       head_user_id
//       interns { ... }
//     }
//   }
// `;
// export async function GET(request, context) {
//   const session = await requireAuth(request, ["admin", "hr", "manager", "mentor"])
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 })
//   }

//   const params = await context.params;
//   const id = params.id;

//   try {
//     const data = await gqlFetch(GET_DEPARTMENT_BY_ID, { id });
//     const department = data?.departments_by_pk ?? null;

//     if (!department) {
//       return NextResponse.json({ error: "Department not found", ok: false }, { status: 404 });
//     }

//     return NextResponse.json(
//       { ok: true, department },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Department fetch error:', error.message);
//     return NextResponse.json({ error: error.message, ok: false }, { status: 500 });
//   }
// }
import { gqlFetch } from "@/lib/graphql-client";
import { requireAuth } from "@/lib/middleware/RequireRole";
import { NextResponse } from "next/server";

const GET_DEPT_BY_MENTOR = `
  query GetDeptByMentor($userId: uuid!) {
    departments(where: { head_user_id: { _eq: $userId } }) {
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
      interns {
        id
        college
        user {
          id
          name
          email
        }
      }
      interns_aggregate {
        aggregate { count }
      }
    }
  }
`;

export async function GET(request) {
  const session = await requireAuth(request, ["admin", "hr", "manager", "mentor"]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required", success: false }, { status: 400 });
  }

  try {
    const data = await gqlFetch(GET_DEPT_BY_MENTOR, { userId });
    return NextResponse.json({ success: true, data: { departments: data?.departments ?? [] } });
  } catch (error) {
    console.error("by-mentor route error:", error.message);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}