import type { ReactNode } from 'react'

// card blanca reutilizada por las páginas del panel admin: AdminLayout tiene fondo oscuro,
// y los states/inputs compartidos (LoadingState, ErrorState, Input, ProductForm) están
// pensados para fondo claro. text-gray-900 fijado acá evita que cualquier hijo herede el
// text-white de AdminLayout — mismo bug de legibilidad que apareció 4 veces antes de esto
interface AdminCardProps {
  children: ReactNode
}

export function AdminCard({ children }: AdminCardProps) {
  return <div className="rounded-xl bg-white p-4 text-gray-900 sm:p-6">{children}</div>
}
