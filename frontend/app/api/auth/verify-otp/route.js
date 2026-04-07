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

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({ ok: false, message: "Email and OTP are required" }, { status: 400 });
        }

        // 1. Fetch user's stored OTP data
        const userResult = await gqlFetch(GET_USER_OTP, { email });
        const users = userResult?.users || [];

        if (users.length === 0) {
            return NextResponse.json({ ok: false, message: "Invalid Request" }, { status: 400 });
        }

        const user = users[0];

        // 2. Ensure an OTP request was actually made
        if (!user.reset_otp || !user.reset_otp_expiry) {
            return NextResponse.json({ ok: false, message: "No OTP request found for this email" }, { status: 400 });
        }

        // 3. Check if OTP is expired
        const now = new Date();
        const expiryDate = new Date(user.reset_otp_expiry);

        if (now > expiryDate) {
            return NextResponse.json({ ok: false, message: "OTP has expired. Please request a new one." }, { status: 400 });
        }

        // 4. Verify OTP against the hash
        const isValid = await bcrypt.compare(otp, user.reset_otp);

        if (!isValid) {
            return NextResponse.json({ ok: false, message: "Invalid OTP provided." }, { status: 400 });
        }

        // OTP is fully valid! We do not clear it yet. We'll clear it when setting the new password.
        return NextResponse.json({ ok: true, message: "OTP verified successfully." });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
    }
};
