import { apiFetch } from './api';

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  image?: string | null;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = { accessToken: string; refreshToken: string };

type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  emailVerificationRequired?: boolean;
  email: string;
};

export const login = (email: string, password: string) =>
  apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    anonymous: true,
  });

export const register = (input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) =>
  apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    anonymous: true,
  });

export const logout = () =>
  apiFetch<null>('/auth/logout', { method: 'POST' });

export const getMe = () => apiFetch<CurrentUser>('/auth/me');

export const forgotPassword = (email: string) =>
  apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    anonymous: true,
  });

export const resetPassword = (token: string, newPassword: string) =>
  apiFetch<null>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    anonymous: true,
  });

export const verifyEmailOtp = (email: string, otp: string) =>
  apiFetch<LoginResponse>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
    anonymous: true,
  });

export const resendOtp = (email: string) =>
  apiFetch<{ message: string }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
    anonymous: true,
  });
