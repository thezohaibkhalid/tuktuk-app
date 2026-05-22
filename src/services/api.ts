import { API_BASE_URL } from '@/lib/env';

export class ApiError extends Error {
  status: number;
  path: string;
  constructor(status: number, path: string, message?: string) {
    super(message ?? `API error ${status}: ${path}`);
    this.status = status;
    this.path = path;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new ApiError(res.status, path);
  }
  const json = await res.json();
  return (json?.data ?? json) as T;
}
