import type { ButtonHTMLAttributes } from 'react'

// variantes disponibles — 'link' se suma recién cuando aparezca un caso real
// (ahí ButtonProps pasa a ser discriminated union, porque cambiaría el elemento renderizado)
type ButtonVariant = 'primary' | 'secondary'

// extiende los atributos nativos (type, onClick, disabled, etc. vienen tipados gratis)
// se omite className a propósito: el call site NUNCA escribe clases de Tailwind a mano
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant: ButtonVariant
  // operación async en vuelo: deshabilita el botón y muestra spinner
  isLoading?: boolean
}

// mapeo de UI: variante semántica → clases Tailwind — vive ACÁ, única fuente de verdad de estilos
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:hover:bg-brand-600',
  secondary:
    'border border-brand-600 text-brand-700 hover:bg-brand-50 disabled:hover:bg-transparent',
}

// clases comunes a toda variante (w-full por mobile first; si aparece un caso de ancho
// automático se agrega un prop semántico, no una clase en el call site)
const BASE_CLASSES =
  'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 sm:text-base'

export function Button({ variant, isLoading = false, disabled, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`}
      // deshabilitado si lo pide el caller o mientras hay una operación en vuelo
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {/* spinner de feedback mientras isLoading (decorativo: el estado ya lo anuncia aria-busy) */}
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
