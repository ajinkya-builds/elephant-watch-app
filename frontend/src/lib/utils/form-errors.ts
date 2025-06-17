import { type ClassValue, clsx } from 'clsx';
import { type FieldError, type FieldErrors } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts error message from form errors
 */
export function getErrorMessage(
  errors: FieldErrors,
  field: string
): string | undefined {
  const error = getNestedError(errors, field);
  return error?.message?.toString();
}

/**
 * Helper to get nested form errors
 */
function getNestedError(
  errors: FieldErrors,
  fieldPath: string
): FieldError | undefined {
  const parts = fieldPath.split('.');
  let current: any = errors;

  for (const part of parts) {
    if (!current) return undefined;
    current = current[part];
  }

  return current as FieldError | undefined;
}

/**
 * Maps server-side errors to form fields
 */
export function mapServerErrors<T>(
  serverErrors: Record<string, string[]>,
  fieldMap: Record<keyof T, string>
): Record<string, { type: string; message: string }> {
  const result: Record<string, { type: string; message: string }> = {};

  for (const [field, messages] of Object.entries(serverErrors)) {
    const fieldName = fieldMap[field as keyof T];
    if (fieldName && messages && messages.length > 0) {
      result[fieldName] = {
        type: 'server',
        message: messages.join(' '),
      };
    }
  }

  return result;
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(
  password: string
): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { valid: true };
}

/**
 * Formats form field names for display
 */
export function formatFieldName(field: string): string {
  // Convert camelCase to Title Case with spaces
  const result = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  
  // Replace common field name parts
  return result
    .replace(/ Url/g, ' URL')
    .replace(/ Id/g, ' ID')
    .replace(/^Id$/, 'ID');
}
