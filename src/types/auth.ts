export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'nurse';
  created_at?: string;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}