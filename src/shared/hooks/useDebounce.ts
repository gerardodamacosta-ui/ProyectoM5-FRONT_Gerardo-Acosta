import { useEffect, useState } from 'react'

// devuelve `value` recién después de `delayMs` sin cambios — evita, por ejemplo,
// filtrar en cada tecla de un buscador y filtrar solo cuando el usuario hace una pausa
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delayMs)
    // si `value` vuelve a cambiar antes de que venza el timeout, se cancela el anterior
    return () => clearTimeout(timeoutId)
  }, [value, delayMs])

  return debounced
}
