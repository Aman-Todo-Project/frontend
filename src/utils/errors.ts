import { isAxiosError, isCancel } from 'axios';
import type { FieldErrors } from '../types/task';

interface ApiErrorBody {
  error?: { message?: string; details?: Record<string, string> };
}

/** Serializable error shape stored in Redux / thrown by `unwrap()` on a rejected thunk. */
export interface ApiFailure {
  message: string;
  fieldErrors: FieldErrors;
}

export function isAbortError(err: unknown): boolean {
  return isCancel(err) || (err instanceof DOMException && err.name === 'AbortError');
}

function isApiFailure(err: unknown): err is ApiFailure {
  return typeof err === 'object' && err !== null && 'message' in err && 'fieldErrors' in err;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isApiFailure(err)) return err.message;
  if (isAxiosError<ApiErrorBody>(err)) {
    if (err.response?.data?.error?.message) return err.response.data.error.message;
    if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
    if (!err.response) return 'Unable to reach the server. Check your connection and try again.';
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function getFieldErrors(err: unknown): FieldErrors {
  if (isApiFailure(err)) return err.fieldErrors;
  if (isAxiosError<ApiErrorBody>(err)) return err.response?.data?.error?.details ?? {};
  return {};
}

export function toApiFailure(err: unknown): ApiFailure {
  return { message: getErrorMessage(err), fieldErrors: getFieldErrors(err) };
}
