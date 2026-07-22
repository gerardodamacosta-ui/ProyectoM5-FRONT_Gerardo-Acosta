import type { ReactNode } from 'react'

// modal genérico por composición: el contenido lo decide quien lo usa (children),
// no intenta prever casos de uso con props de más (ej. no bodyText/showConfirmButton)
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    // overlay: clickear afuera del contenido cierra el modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* stopPropagation: un click DENTRO del contenido no debe burbujear y cerrar el modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-white p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
          {/* botón explícito de cierre — junto al click en overlay, sin manejar Escape (mantenerlo simple) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto text-xl leading-none text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
