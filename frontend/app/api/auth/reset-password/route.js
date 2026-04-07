import { gqlFetch } from "@/lib/graphql-client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const GET_USER_OTP = `
    query GetUserOtp($email: String!) {
        users(where: {email: {_eq: $email}}) {
            id
            reset_otp
            reset_otp_expiry
        }
    }
`;

const UPDATE_PASSWORD = `
    mutation UpdatePassword($email: String!, $password_hash: String!) {
        update_users(
            where: {email: {_eq: $email}}, 
            _set: {
                password_hash: $password_hash,
                reset_otp: null, 
                reset_otp_expiry: null
            }
        ) {
            affected_rows
        }
    }
`;

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ ok: false, message: "Password must be at least 6 characters" }, { status: 400 });
        }

        // 1. Fetch user's stored OTP data to verify one last time
        const userResult = await gqlFetch(GET_USER_OTP, { email });
        const users = userResult?.users || [];

        if (users.length === 0) {
            return NextResponse.json({ ok: false, message: "Invalid Request" }, { status: 400 });
        }

        const user = users[0];

        // 2. Ensure an OTP request was actually made
        if (!user.reset_otp || !user.reset_otp_expiry) {
            return NextResponse.json({ ok: false, message: "No active password reset request found" }, { status: 400 });
        }

        // 3. Check if OTP is expired
        const now = new Date();
        const expiryDate = new Date(user.reset_otp_expiry);

        if (now > expiryDate) {
            return NextResponse.json({ ok: false, message: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        // 4. Verify OTP against the hash securely
        const isValid = await bcrypt.compare(otp, user.reset_otp);

        if (!isValid) {
            return NextResponse.json({ ok: false, message: "Invalid OTP provided." }, { status: 400 });
        }

        // 5. Hash the new password and apply updates
        const password_hash = await bcrypt.hash(newPassword, 10);

        const updateResult = await gqlFetch(UPDATE_PASSWORD, { email, password_hash });

        if (!updateResult?.update_users?.affected_rows) {
            throw new Error("Failed to update user password in database");
        }

        return NextResponse.json({ ok: true, message: "Password has been successfully updated!" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
    }
};
