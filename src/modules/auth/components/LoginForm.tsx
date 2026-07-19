import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { isValidEmail } from '@/shared/utils/validators'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import type { LoginFormData } from '@/modules/auth/types/auth.types'

// errores de validación local, uno por campo
type FieldErrors = Partial<Record<keyof LoginFormData, string>>

export function LoginForm() {
  const { loginWithEmail, loading, error } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // actualiza el campo que cambió (name coincide con la key del estado)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // validación local previa al submit — la de credenciales la hace Firebase
  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!formData.email.trim()) errors.email = 'Ingresá tu email.'
    else if (!isValidEmail(formData.email)) errors.email = 'El email no tiene un formato válido.'
    if (!formData.password) errors.password = 'Ingresá tu contraseña.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    // el resultado (éxito o error legible) queda en el estado global de auth
    await loginWithEmail(formData)
  }

  return (
    // noValidate: la validación y sus mensajes los maneja el form, no el navegador
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={fieldErrors.email}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
      />

      {/* error global de auth (credenciales inválidas, red, etc.) ya traducido a español */}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button variant="primary" type="submit" isLoading={loading}>
        Iniciar sesión
      </Button>
    </form>
  )
}
