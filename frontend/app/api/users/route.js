import { gqlFetch } from "@/lib/graphql-client"
import { requireAuth } from "@/lib/middleware/RequireRole"
import { NextResponse } from "next/server"
import { z } from "zod"

const userSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "hr", "mentor", "intern"])
})


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

const CREATE_USER = `
    mutation CreateUser($name: String!, $email: String!, $password_hash: String!, $role: String!) {
        insert_users_one(object: {
            name: $name,
            email: $email,
            password_hash: $password_hash,
            role: $role
        }) {
            id
            name
            email
            role
        }
    }
`

export const GET = async (req) => {
    try {
        const session = await requireAuth(req, ["admin", "hr"])
        if (!session) {
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
        }
        const users = await gqlFetch(GET_ALL_USERS)
        return NextResponse.json({ ok: true, data: users?.users || [], message: "Users fetched successfully" })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ ok: false, message: error.message || "Internal server error" }, { status: 500 })
    }
}

export const POST = async (req) => {
    try {
        const session = await requireAuth(req, ["admin", "hr"])
        if (!session) {
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
        }
        
        const body = await req.json();
        const { name, email, password, role } = body;
        
        const validation = userSchema.safeParse({ name, email, password, role });
        if (!validation.success) {
            return NextResponse.json({ ok: false, message: validation.error.message }, { status: 400 })
        }

        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash(password, 10);
        
        const variables = { name, email, password_hash, role };
        const result = await gqlFetch(CREATE_USER, variables);
        
        if (result?.errors) {
            return NextResponse.json({ ok: false, message: result.errors[0].message }, { status: 400 })
        }

        return NextResponse.json({ ok: true, data: result.insert_users_one, message: "User created successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ ok: false, message: error.message || "Internal server error" }, { status: 500 })
    }
}