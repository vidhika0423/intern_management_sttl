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


const GET_PAGINATED_USERS = `
    query GetPaginatedUsers($limit: Int!, $offset: Int!, $where: users_bool_exp) {
        users(limit: $limit, offset: $offset, where: $where, order_by: {id: desc}) {
            id
            name
            email
            role
        }
        users_aggregate(where: $where) {
            aggregate {
                count
            }
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

const GET_USER_BY_EMAIL = `
    query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
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

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";

        const offset = (page - 1) * limit;

        const where = {
            _and: [
                role ? { role: { _eq: role } } : {},
                {
                    _or: [
                        { name: { _ilike: `%${search}%` } },
                        { email: { _ilike: `%${search}%` } }
                    ]
                }
            ]
        };

        const result = await gqlFetch(GET_PAGINATED_USERS, { limit, offset, where });
        const users = result?.users || [];
        const totalCount = result?.users_aggregate?.aggregate?.count || 0;

        return NextResponse.json({
            ok: true,
            data: users,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            message: "Users fetched successfully"
        });
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

        const user = await gqlFetch(GET_USER_BY_EMAIL, { email });
        if (user?.users?.length > 0) {
            return NextResponse.json({ ok: false, message: "User already exists" }, { status: 400 })
        }

        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash(password, 10);
        
        const variables = { name, email, password_hash, role };
        const result = await gqlFetch(CREATE_USER, variables);
        
        if (result?.errors) {
            return NextResponse.json({ ok: false, error: result.errors[0].message, message: "Failed to create user" }, { status: 400 })
        }

        return NextResponse.json({ ok: true, data: result.insert_users_one, message: "User created successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ ok: false, message: error.message || "Internal server error" }, { status: 500 })
    }
}