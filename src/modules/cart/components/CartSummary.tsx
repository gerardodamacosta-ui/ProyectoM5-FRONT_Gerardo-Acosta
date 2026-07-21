import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/constants'
import { Button } from '@/shared/components/ui/Button'
import { formatPrice } from '@/shared/utils/formatters'

interface CartSummaryProps {
  total: number
}

// total general + botón que lleva al checkout
export function CartSummary({ total }: CartSummaryProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600 sm:text-base">Total</span>
        <span className="text-xl font-bold text-gray-900 sm:text-2xl">{formatPrice(total)}</span>
      </div>
      <Button type="button" variant="primary" onClick={() => navigate(ROUTES.checkout)}>
        Ir a checkout
      </Button>
    </div>
  )
}
