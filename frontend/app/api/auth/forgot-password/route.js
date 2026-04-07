import { gqlFetch } from "@/lib/graphql-client";
import { sendMail } from "@/lib/mailService/SendMail";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";

const GET_USER_BY_EMAIL = `
    query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
            id
            email
            name
        }
    }
`;

const UPDATE_USER_OTP = `
    mutation UpdateUserOtp($email: String!, $reset_otp: String!, $reset_otp_expiry: timestamptz!) {
        update_users(where: {email: {_eq: $email}}, _set: {reset_otp: $reset_otp, reset_otp_expiry: $reset_otp_expiry}) {
            affected_rows
        }
    }
`;

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ ok: false, message: "Email is required" }, { status: 400 });
        }

        // 1. Check if user exists
        const userResult = await gqlFetch(GET_USER_BY_EMAIL, { email });
        const users = userResult?.users || [];

        if (users.length === 0) {
            // Return success anyway to prevent email enumeration attacks
            return NextResponse.json({ ok: true, message: "If your email is registered, you will receive an OTP shortly." });
        }

        const user = users[0];

        // 2. Generate a secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // 3. Hash the OTP for secure DB storage
        const reset_otp = await bcrypt.hash(otp, 10);

        // 4. Set expiry to 10 minutes from now
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);
        const reset_otp_expiry = expiryDate.toISOString();

        // 5. Store in database
        const updateResult = await gqlFetch(UPDATE_USER_OTP, { email, reset_otp, reset_otp_expiry });
        
        if (!updateResult?.update_users?.affected_rows) {
            throw new Error("Failed to update OTP in database");
        }

        // 6. Send the email
        const mailText = `Hello ${user.name},\n\nYou requested to reset your password.\nYour OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\nIf you did not request this, please ignore this email.`;
        const mailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>We received a request to reset your password. Use the following OTP to proceed:</p>
                <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
                <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                <p>If you did not make this request, please ignore this email.</p>
            </div>
        `;

        await sendMail({
            sendTo: email,
            subject: "Your Password Reset OTP",
            text: mailText,
            html: mailHtml,
        });

        return NextResponse.json({ ok: true, message: "If your email is registered, you will receive an OTP shortly." });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ ok: false, message: "Internal server error" }, { status: 500 });
    }
};
