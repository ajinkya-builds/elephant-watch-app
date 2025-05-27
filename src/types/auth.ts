export type UserRole = 'admin' | 'manager' | 'data_collector';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
} 