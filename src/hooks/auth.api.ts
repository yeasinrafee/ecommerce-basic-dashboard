import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { AuthRoutes } from '@/routes/auth.route';
import type { ApiResponse } from '@/types/auth';
import { toast } from 'react-hot-toast';

export interface VerifyOtpPayload {
  userId: string;
  code: string;
}

const ensurePayload = (response: ApiResponse<null>, fallbackMessage: string) => {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response;
};

const verifyOtpRequest = async (payload: VerifyOtpPayload) => {
  const response = await apiClient.post<ApiResponse<null>>(AuthRoutes.verifyOtp, payload);
  return ensurePayload(response.data, 'Unable to verify OTP');
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtpRequest,
    onSuccess: (result) => {
      toast.success(result.message || 'OTP verified successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to verify OTP';
      toast.error(message);
    },
  });
};

interface SendOtpPayload {
  userId: string;
}

interface SendOtpResponse {
  otpExpiry: string | null;
}

const sendOtpRequest = async (payload: SendOtpPayload) => {
  const response = await apiClient.post<ApiResponse<SendOtpResponse>>(AuthRoutes.sendOtp, payload);
  const data = ensurePayload(response.data, 'Unable to send OTP');
  return { message: response.data.message, payload: data };
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: sendOtpRequest,
    onSuccess: (result) => {
      toast.success(result.message || 'OTP sent');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to send OTP';
      toast.error(message);
    },
  });
};
