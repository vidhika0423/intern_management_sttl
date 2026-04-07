import toast from "react-hot-toast";

export const forgotPassword = async (email) => {
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const res = await response.json();
        if (res.ok) {
            toast.success(res.message || "OTP sent successfully");
        } else {
            toast.error(res.message || "Failed to send OTP");
        }
        return res;
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        return { ok: false, message: "Something went wrong" };
    }
};

export const verifyOtp = async (email, otp) => {
    try {
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const res = await response.json();
        if (res.ok) {
            toast.success(res.message || "OTP verified successfully");
        } else {
            toast.error(res.message || "Invalid OTP");
        }
        return res;
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        return { ok: false, message: "Something went wrong" };
    }
};

export const resetPassword = async (email, otp, newPassword) => {
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword }),
        });
        const res = await response.json();
        if (res.ok) {
            toast.success(res.message || "Password reset successfully");
        } else {
            toast.error(res.message || "Failed to reset password");
        }
        return res;
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return { ok: false, message: "Something went wrong" };
    }
};
