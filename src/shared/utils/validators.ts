// validadores puros reutilizables entre forms (login, registro, checkout, etc.)

// mínimo de caracteres de contraseña — coincide con la regla de Firebase Auth
export const MIN_PASSWORD_LENGTH = 6

// formato de email razonable: algo@algo.algo (la validación real la hace Firebase al autenticar)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}
