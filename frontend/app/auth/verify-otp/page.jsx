"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import { z } from "zod";
import { zodToFormikValidate } from "@/utils/zodToFormik";
import { verifyOtp } from "@/services/AuthApi";

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

function VerifyOtpForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { handleSubmit, handleChange, values, errors, touched, handleBlur } =
    useFormik({
      initialValues: { otp: "" },
      validate: zodToFormikValidate(verifyOtpSchema),
      onSubmit: async (values) => {
        if (!email) {
            return;
        }

        setLoading(true);
        const res = await verifyOtp(email, values.otp);

        if (res.ok) {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(values.otp)}`);
        }
        
        setLoading(false);
      },
    });

  if (!email) {
      return (
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
              <h2 className="text-xl text-red-500 mb-4">Invalid Request</h2>
              <p className="text-gray-500 mb-4">Missing email parameter.</p>
              <Link className="text-[#6366f1] underline" href="/auth/forgot-password">Go back</Link>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md h-fit flex flex-col gap-5 px-8 py-12 justify-center text-center bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">
        Verify OTP
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        We sent an OTP to <strong>{email}</strong>. Enter the 6-digit code below.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* OTP */}
        <div className="w-full flex flex-col items-start">
          <input
            name="otp"
            className={`w-full text-center tracking-[0.5em] text-lg bg-[#f0f4ff] p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#6366f1] ${
              errors.otp && touched.otp ? "border-red-500" : "border-gray-200"
            }`}
            type="text"
            placeholder="------"
            maxLength={6}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.otp}
          />
          {errors.otp && touched.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
          )}
        </div>

        <button
          className="w-full bg-[#6366f1] hover:bg-[#4f46e5] transition-colors text-white font-semibold cursor-pointer py-3 rounded-lg mt-2"
          type="submit"
          disabled={loading || values.otp.length !== 6}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <p className="text-gray-500 mt-4 text-sm">
        Didn't receive the code?{" "}
        <Link className="text-[#6366f1] font-medium hover:underline" href="/auth/forgot-password">
          Resend
        </Link>
      </p>
    </div>
  );
}

function VerifyOtpPage() {
    return (
        <div className="w-full h-screen flex justify-center items-center bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyOtpForm />
            </Suspense>
        </div>
    );
}

export default VerifyOtpPage;
