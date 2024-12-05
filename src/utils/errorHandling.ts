export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function isSupabaseError(error: unknown): error is { message: string; code: string } {
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error;
}

export function handleDatabaseError(error: unknown): never {
  if (isSupabaseError(error)) {
    throw new DatabaseError(error.message, error);
  }
  throw new DatabaseError('An unexpected database error occurred', error);
}