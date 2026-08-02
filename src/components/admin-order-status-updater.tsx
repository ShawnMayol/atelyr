"use client"

import { useState } from "react"
import type { OrderStatus } from "@/types/database"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { ChevronDown, Loader2 } from "lucide-react"

type AdminOrderStatusUpdaterProps = {
  orderId: string
  currentStatus: OrderStatus
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function AdminOrderStatusUpdater({
  orderId,
  currentStatus,
}: AdminOrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: OrderStatus) => {
    setLoading(true)
    const res = await updateOrderStatus(orderId, newStatus)
    setLoading(false)

    if (res.success) {
      setStatus(newStatus)
    } else {
      alert(res.error || "Failed to update status.")
    }
  }

  return (
    <div className="flex items-center gap-3 bg-light p-3 border border-forest/15 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-forest/50">
        Order Status:
      </span>
      <div className="relative">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          className="appearance-none bg-forest-ghost-white text-xs font-semibold uppercase tracking-wider py-2 pl-3 pr-8 rounded-sm focus:outline-none cursor-pointer disabled:opacity-50"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-white pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-white pointer-events-none" />
        )}
      </div>
    </div>
  )
}
