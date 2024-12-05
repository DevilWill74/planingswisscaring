export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  connectionTimeout: 10000,
  maxRetries: 3,
  retryDelay: 1000,
};

export const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  role: 'admin' as const
};