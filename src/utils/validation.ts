export interface PasswordValidation {
  isValid: boolean;
  error?: string;
}

export function validatePassword(password: string): PasswordValidation {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins une majuscule'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins une minuscule'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins un chiffre'
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: 'Le mot de passe doit contenir au moins un caractère spécial'
    };
  }

  return { isValid: true };
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,}$/.test(username);
}