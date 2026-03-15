"use client";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomPasswordInput from "@/components/FormFields/CustomPasswordInput";
import CustomButton from "@/components/Common/CustomButton";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthRoutes } from "@/routes/auth.route";
import { useRouter } from "next/navigation";
import type { ApiResponse, AuthData, LoginCredentials } from "@/types/auth";
import {
  useForgotPasswordSendOtp,
  useForgotPasswordVerifyOtp,
  useResetPassword,
} from "@/hooks/auth.api";
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

type ViewState =
  | "login"
  | "forgot-password-email"
  | "forgot-password-otp"
  | "reset-password";

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
  const [otpSecondsLeft, setOtpSecondsLeft] = useState<number>(0);
  const otpTimerRef = useRef<number | null>(null);
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
      // Support both server shapes: { data: { user: {...} } } and { data: { ...userFields } }
      const user = (payload as any).user ?? payload;
      if (!user || !user.email) {
        throw new Error("Invalid user data in login response");
      }

      const stored = {
        email: user.email,
        role: user.role,
        name: user.name,
        image: user.image,
      };

      // Set user in store before navigation so dashboard has the auth state available
      setUser(stored);
      setPassword("");
      toast.success(`Welcome, ${user.name || 'User'}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await sendOtpMutation.mutateAsync({
        email: forgotEmail.trim(),
      });
      if (res.payload) {
        setResetUserId(res.payload.userId);
        setOtpExpiry(res.payload.otpExpiry);
        setOtpCode("");
        setView("forgot-password-otp");
      }
    } catch (err: any) {}
  };

  const handleForgotPasswordFromLogin = async (
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    setError(null);
    const emailValue = email.trim();
    if (!emailValue) {
      setError("Please enter your email to reset your password.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await sendOtpMutation.mutateAsync({ email: emailValue });
      if (res.payload) {
        setResetUserId(res.payload.userId);
        setOtpExpiry(res.payload.otpExpiry);
        setForgotEmail(emailValue);
        setOtpCode("");
        setView("forgot-password-otp");
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err: unknown) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!otpExpiry) {
      setOtpSecondsLeft(0);
      return;
    }

    if (otpTimerRef.current) {
      clearInterval(otpTimerRef.current);
      otpTimerRef.current = null;
    }

    const msLeft = new Date(otpExpiry).getTime() - Date.now();
    let seconds = Math.max(0, Math.ceil(msLeft / 1000));
    setOtpSecondsLeft(seconds);

    if (seconds > 0) {
      const id = window.setInterval(() => {
        setOtpSecondsLeft((prev) => {
          if (prev <= 1) {
            if (otpTimerRef.current) {
              clearInterval(otpTimerRef.current);
              otpTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      otpTimerRef.current = id;
      return () => {
        if (otpTimerRef.current) {
          clearInterval(otpTimerRef.current);
          otpTimerRef.current = null;
        }
        clearInterval(id);
      };
    }
  }, [otpExpiry]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleResendOtp = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setError(null);
    const emailValue = forgotEmail.trim();
    if (!emailValue) {
      setError("No email available to resend OTP.");
      return;
    }
    try {
      const res = await sendOtpMutation.mutateAsync({ email: emailValue });
      if (res.payload) {
        setResetUserId(res.payload.userId);
        setOtpExpiry(res.payload.otpExpiry);
        setOtpCode("");
        // toast.success("OTP resent to your email.");
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (err: unknown) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error(message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    try {
      await verifyOtpMutation.mutateAsync({
        userId: resetUserId,
        code: otpCode,
      });
      setView("reset-password");
    } catch (err: any) {}
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
        newPassword,
      });
      setView("login");
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {}
  };

  if (view === "forgot-password-email") {
    return (
      <form
        onSubmit={handleSendOtp}
        className="space-y-6 border shadow-sm border-slate-200 rounded-md p-6 w-full max-w-sm md:max-w-[600px]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">
            Reset Password
          </span>
          <span className="text-xs text-slate-500">
            Enter your email to receive an OTP.
          </span>
        </div>
        <CustomInput
          label="Email"
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          required
        />
        <div className="flex gap-2">
          {/* <CustomButton
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setView("login");
              setOtpExpiry(null);
              setOtpCode("");
              setResetUserId("");
            }}
          >
            Cancel
          </CustomButton> */}
          <CustomButton
            type="submit"
            loading={sendOtpMutation.isPending}
            className="w-full"
          >
            Send OTP
          </CustomButton>
        </div>
      </form>
    );
  }

  if (view === "forgot-password-otp") {
    return (
      <form
        onSubmit={handleVerifyOtp}
        className="space-y-6 border shadow-sm p-6 rounded-md border-slate-200 w-full max-w-sm md:max-w-[600px]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">
            Verify OTP
          </span>
          <span className="text-xs text-slate-500">
            Enter the OTP sent to {forgotEmail}
          </span>
        </div>
        <OtpInput
          length={6}
          value={otpCode}
          onChange={setOtpCode}
          allowedPattern="^\\d+$"
          placeholderChar="●"
          expiry={otpExpiry}
        />
        <div className="flex items-center justify-center gap-x-2 text-sm text-brand-primary font-semibold mt-2">
          <span className="text-xs">Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={sendOtpMutation.isPending || otpSecondsLeft > 0}
            aria-disabled={sendOtpMutation.isPending || otpSecondsLeft > 0}
            className={`text-sm font-medium ${sendOtpMutation.isPending || otpSecondsLeft > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'}`}
          >
            {sendOtpMutation.isPending
              ? 'Sending...'
              : otpSecondsLeft > 0
              ? `Resend OTP (${formatTime(otpSecondsLeft)})`
              : 'Resend OTP'}
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <CustomButton
            type="submit"
            loading={verifyOtpMutation.isPending}
            disabled={otpCode.length < 6}
            className="w-full"
          >
            Verify
          </CustomButton>
        </div>
      </form>
    );
  }

  if (view === "reset-password") {
    return (
      <form
        onSubmit={handleResetPassword}
        className="space-y-6 border shadow-sm border-slate-200 rounded p-4 w-full max-w-sm md:max-w-[400px]"
      >
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold text-slate-900">
            New Password
          </span>
          <span className="text-xs text-slate-500">
            Enter your new password below.
          </span>
        </div>
        <CustomPasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <CustomPasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <div className="flex gap-2 mt-4">
          <CustomButton
            type="submit"
            loading={resetPasswordMutation.isPending}
            className="w-full"
          >
            Reset
          </CustomButton>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <CustomButton type="submit" loading={loading} className="w-full">
        Login
      </CustomButton>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleForgotPasswordFromLogin}
          disabled={sendOtpMutation.isPending}
          aria-disabled={sendOtpMutation.isPending}
          className={`text-sm font-medium ${sendOtpMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer'}`}
        >
          {sendOtpMutation.isPending ? 'Sending...' : 'Forgot password?'}
        </button>
      </div>
    </form>
  );
};

export default Login;
