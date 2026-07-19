import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { isValidEmail, MIN_PASSWORD_LENGTH } from '@/shared/utils/validators'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import type { RegisterFormData } from '@/modules/auth/types/auth.types'

// errores de validación local, uno por campo
type FieldErrors = Partial<Record<keyof RegisterFormData, string>>

export function RegisterForm() {
  const { registerWithEmail, loading, error } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: '',
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // actualiza el campo que cambió (name coincide con la key del estado)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // validación local previa al submit
  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!formData.displayName.trim()) errors.displayName = 'Ingresá tu nombre.'
    if (!formData.email.trim()) errors.email = 'Ingresá tu email.'
    else if (!isValidEmail(formData.email)) errors.email = 'El email no tiene un formato válido.'
    if (!formData.password) errors.password = 'Ingresá una contraseña.'
    else if (formData.password.length < MIN_PASSWORD_LENGTH)
      errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    // crea la cuenta + el perfil con role customer; el resultado queda en el estado global
    await registerWithEmail(formData)
  }

  return (
    // noValidate: la validación y sus mensajes los maneja el form, no el navegador
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre"
        name="displayName"
        type="text"
        autoComplete="name"
        value={formData.displayName}
        onChange={handleChange}
        error={fieldErrors.displayName}
      />
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
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        error={fieldErrors.password}
      />

      {/* error global de auth (email ya registrado, red, etc.) ya traducido a español */}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button variant="primary" type="submit" isLoading={loading}>
        Crear cuenta
      </Button>
    </form>
  )
}
