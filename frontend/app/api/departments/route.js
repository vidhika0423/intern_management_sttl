import { gqlFetch } from "@/lib/graphql-client";
import { requireAuth } from "@/lib/middleware/RequireRole";
import { NextResponse } from "next/server";

const DEPARTMENT_QUERY = `
    query DepartmentList {
        departments {
            description
            name
            id
            user {
                email
                name
            }
        }
    }
`


export async function GET(req) {
    const session = await requireAuth(req, ["admin"])
    if (!session) {
        return NextResponse.json({ error: "Unauthorized", ok: false }, { status: 401 })
    }
    try {
        const data = await gqlFetch(DEPARTMENT_QUERY)

        return NextResponse.json(
            {
                success: true,
                message: "Departments fetched successfully",
                data: data
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Department error:', error.message)
        return NextResponse.json({ error: error.message, ok: false }, { status: 500 })
    }
}   
