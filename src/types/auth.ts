export type UserRole = 'admin' | 'manager' | 'data_collector';

export interface User {
  id: string;
  email_or_phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
} 