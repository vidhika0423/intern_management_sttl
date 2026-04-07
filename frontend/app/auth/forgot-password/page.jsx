"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { zodToFormikValidate } from "@/utils/zodToFormik";
import { forgotPassword } from "@/services/AuthApi";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: { email: "" },
      validate: zodToFormikValidate(forgotPasswordSchema),
      onSubmit: async (values) => {
        setLoading(true);
        const res = await forgotPassword(values.email);

        if (res.ok) {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
        }
        
        setLoading(false);
      },
    });

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md h-fit flex flex-col gap-5 px-8 py-12 justify-center text-center bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* EMAIL */}
          <div className="w-full flex flex-col items-start">
            <input
              name="email"
              className={`w-full bg-[#f0f4ff] p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6366f1] ${
                errors.email && touched.email ? "border-red-500" : "border-gray-200"
              }`}
              type="text"
              placeholder="xyz@company.com"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <button
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] transition-colors text-white font-semibold cursor-pointer py-3 rounded-lg mt-2"
            type="submit"
            disabled={loading || !values.email}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-gray-500 mt-4 text-sm">
          Remembered your password?{" "}
          <Link className="text-[#6366f1] font-medium hover:underline" href="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
