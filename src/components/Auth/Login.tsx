"use client";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomPasswordInput from "@/components/FormFields/CustomPasswordInput";
import CustomButton from "@/components/Common/CustomButton";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthRoutes } from "@/routes/auth.route";
import { useRouter } from "next/navigation";
import type { ApiResponse, AuthData, LoginCredentials } from "@/types/auth";
import { useForgotPasswordSendOtp, useForgotPasswordVerifyOtp, useResetPassword } from "@/hooks/auth.api";
import OtpInput from "@/components/FormFields/OtpInput";

const ERROR_MESSAGE =
  "Login failed. Please verify your credentials and try again.";

const resolveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGE;
};

type ViewState = "login" | "forgot-password-email" | "forgot-password-otp" | "reset-password";

const Login = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [view, setView] = useState<ViewState>("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetUserId, setResetUserId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtpMutation = useForgotPasswordSendOtp();
  const verifyOtpMutation = useForgotPasswordVerifyOtp();
  const resetPasswordMutation = useResetPassword();

  const handleLoginSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const credentials: LoginCredentials = {
      email: email.trim(),
      password,
    };

    try {
      const response = await apiClient.post<ApiResponse<AuthData>>(
        AuthRoutes.login,
        credentials,
      );
      const payload = response.data.data;
      if (!payload) {
        throw new Error("Invalid login response");
      }
      const { user } = payload;
      const stored = {
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
      };
      toast.success(`Welcome, ${user.name}!`);
      router.push("/dashboard");
      setTimeout(() => {
        setUser(stored);
        setPassword("");
      }, 0);
    } catch (err: unknown) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error(message);
      setLoading(false);
    } finally {
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await sendOtpMutation.mutateAsync({ email: forgotEmail.trim() });
      if (res.payload) {
        setResetUserId(res.payload.userId);
        setOtpExpiry(res.payload.otpExpiry);
        setOtpCode("");
        setView("forgot-password-otp");
      }
    } catch (err: any) {
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    try {
      await verifyOtpMutation.mutateAsync({ userId: resetUserId, code: otpCode });
      setView("reset-password");
    } catch (err: any) {
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await resetPasswordMutation.mutateAsync({
        userId: resetUserId,
        code: otpCode,
        newPassword
      });
      setView("login");
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
    }
  };

  if (view === "forgot-password-email") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-6 border shadow-sm border-slate-200 rounded p-4 w-full max-w-sm md:max-w-[400px]">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">Reset Password</span>
          <span className="text-xs text-slate-500">Enter your email to receive an OTP.</span>
        </div>
        <CustomInput label="Email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
        <div className="flex gap-2">
          <CustomButton type="button" variant="ghost" className="w-full" onClick={() => setView("login")}>Cancel</CustomButton>
          <CustomButton type="submit" loading={sendOtpMutation.isPending} className="w-full">Send OTP</CustomButton>
        </div>
      </form>
    );
  }

  if (view === "forgot-password-otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-6 border shadow-sm p-6 rounded-md border-slate-200 w-full max-w-sm md:max-w-[600px]">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">Verify OTP</span>
          <span className="text-xs text-slate-500">Enter the OTP sent to {forgotEmail}</span>
        </div>
        <OtpInput length={6} value={otpCode} onChange={setOtpCode} allowedPattern="^\\d+$" placeholderChar="●" expiry={otpExpiry} />
        <div className="flex gap-2 mt-4">
          <CustomButton type="button" variant="ghost" className="w-full" onClick={() => setView("login")}>Cancel</CustomButton>
          <CustomButton type="submit" loading={verifyOtpMutation.isPending} disabled={otpCode.length < 6} className="w-full">Verify</CustomButton>
        </div>
      </form>
    );
  }

  if (view === "reset-password") {
    return (
      <form onSubmit={handleResetPassword} className="space-y-6 border shadow-sm border-slate-200 rounded p-4 w-full max-w-sm md:max-w-[400px]">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">New Password</span>
          <span className="text-xs text-slate-500">Enter your new password below.</span>
        </div>
        <CustomPasswordInput label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <CustomPasswordInput label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <div className="flex gap-2 mt-4">
          <CustomButton type="button" variant="ghost" className="w-full" onClick={() => setView("login")}>Cancel</CustomButton>
          <CustomButton type="submit" loading={resetPasswordMutation.isPending} className="w-full">Reset</CustomButton>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleLoginSubmit}
      className="space-y-6 border shadow-sm border-slate-200 rounded p-4 w-full max-w-sm md:max-w-[400px]"
    >
      <CustomInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <CustomPasswordInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setView("forgot-password-email")}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Forgot password?
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <CustomButton type="submit" loading={loading} className="w-full">
        Login
      </CustomButton>
    </form>
  );
};

export default Login;
