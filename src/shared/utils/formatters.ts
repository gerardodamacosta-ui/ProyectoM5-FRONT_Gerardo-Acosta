// formateadores reutilizables — evita repetir Intl.NumberFormat en cada componente que muestra precios

// formatea un número como precio en pesos argentinos (ej. 850000 → "$850.000")
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

// formatea una fecha ISO a formato legible en español (ej. "21 jul 2026")
export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value)
  )
}
