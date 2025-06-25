// frontend/src/types/supabase.ts
// This is a placeholder file to resolve the 'Cannot find module' error.
// You might need to adjust the Profile interface based on your actual Supabase schema.

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'admin' | 'manager' | 'data_collector' | 'viewer' | null;
  position: 'Ranger' | 'DFO' | 'Officer' | 'Guard' | 'Manager' | 'Admin' | null;
}
