"use client";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomPasswordInput from "@/components/FormFields/CustomPasswordInput";
import CustomButton from "@/components/Common/CustomButton";
import { apiClient } from "@/lib/api";
import { setAuthCookies } from "@/lib/cookies";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthResponse, LoginCredentials } from "@/types/auth";

const ERROR_MESSAGE = "Login failed. Please verify your credentials and try again.";

const resolveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGE;
};

const Login = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const credentials: LoginCredentials = {
      email: email.trim(),
      password
    };

    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
      const { user, tokens } = response.data;

      setAuth(user, tokens);
      setAuthCookies(tokens);
      toast.success(`Welcome back, ${user.name}!`);
      setPassword("");
    } catch (err: unknown) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border shadow-sm border-slate-200 rounded p-4 w-full max-w-sm md:max-w-[400px]">
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
    </form>
  );
};

export default Login;