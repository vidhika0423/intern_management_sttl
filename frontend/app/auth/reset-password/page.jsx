"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { zodToFormikValidate } from "@/utils/zodToFormik";
import { resetPassword } from "@/services/AuthApi";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const otp = searchParams.get("otp");

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: { newPassword: "", confirmPassword: "" },
      validate: zodToFormikValidate(resetPasswordSchema),
      onSubmit: async (values) => {
        if (!email || !otp) {
            return;
        }

        setLoading(true);
        const res = await resetPassword(email, otp, values.newPassword);

        if (res.ok) {
          router.push(`/auth/login`);
        }
        
        setLoading(false);
      },
    });

  if (!email || !otp) {
      return (
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
              <h2 className="text-xl text-red-500 mb-4">Invalid Request</h2>
              <p className="text-gray-500 mb-4">Missing email or OTP parameters.</p>
              <Link className="text-[#6366f1] underline" href="/auth/forgot-password">Go back to Forgot Password</Link>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md h-fit flex flex-col gap-5 px-8 py-12 justify-center text-center bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        Reset Password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* NEW PASSWORD */}
        <div className="w-full flex flex-col items-start">
          <input
            name="newPassword"
            className={`w-full bg-[#f0f4ff] p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6366f1] ${
              errors.newPassword && touched.newPassword ? "border-red-500" : "border-gray-200"
            }`}
            type="password"
            placeholder="New Password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.newPassword}
          />
          {errors.newPassword && touched.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="w-full flex flex-col items-start">
          <input
            name="confirmPassword"
            className={`w-full bg-[#f0f4ff] p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6366f1] ${
              errors.confirmPassword && touched.confirmPassword ? "border-red-500" : "border-gray-200"
            }`}
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.confirmPassword}
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          className="w-full bg-[#6366f1] hover:bg-[#4f46e5] transition-colors text-white font-semibold cursor-pointer py-3 rounded-lg mt-2"
          type="submit"
          disabled={loading || !values.newPassword || !values.confirmPassword}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

function ResetPasswordPage() {
    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

export default ResetPasswordPage;
