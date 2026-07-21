import { Input } from '@/shared/components/ui/Input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

// input controlado; el debounce se aplica en CatalogPage (quien filtra), no acá —
// este componente solo refleja lo que el usuario está escribiendo, sin delay visual
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      label="Buscar productos"
      type="search"
      placeholder="Ej: notebook, mouse, auriculares..."
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
