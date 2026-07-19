import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

// input compartido con label y mensaje de error asociados — la accesibilidad
// (htmlFor/id, aria-invalid, aria-describedby) se resuelve una sola vez acá
// se omite className: el call site nunca escribe clases de Tailwind a mano
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  // mensaje de validación pegado al campo; además pinta el borde en rojo
  error?: string
}

// mapeo de UI: estado normal vs. con error → clases Tailwind
const BASE_CLASSES =
  'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 sm:text-base'
const NORMAL_CLASSES = 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/30'
const ERROR_CLASSES = 'border-red-500 focus:border-red-500 focus:ring-red-500/30'

export function Input({ label, error, id, ...rest }: InputProps) {
  // id autogenerado si no viene uno (useId garantiza unicidad, clave si el form repite el componente)
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`

  return (
    <div className="flex w-full flex-col gap-1">
      {/* label siempre visible y asociado por htmlFor (nunca placeholder como único label) */}
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`${BASE_CLASSES} ${error ? ERROR_CLASSES : NORMAL_CLASSES}`}
        // marca el campo como inválido y linkea el mensaje para lectores de pantalla
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {/* mensaje de validación pegado al campo — role="alert" lo anuncia al aparecer */}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
