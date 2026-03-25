import { gqlFetch } from "@/lib/graphql-client"
import { requireAuth } from "@/lib/middleware/RequireRole"
import { NextResponse } from "next/server"

const GET_ALL_USERS = `
    query GetAllUsers {
        users {
            id
            name
            email
            role
        }
    }
`

export const GET = async (req) => {
    try {
        const session = await requireAuth(req, ["admin"])
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const users = await gqlFetch(GET_ALL_USERS)
        return NextResponse.json({ data: users })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}