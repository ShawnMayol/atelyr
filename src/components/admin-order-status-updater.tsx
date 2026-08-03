"use client"

import { useState } from "react"
import type { OrderStatus } from "@/types/database"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { ChevronDown, Loader2 } from "lucide-react"

type AdminOrderStatusUpdaterProps = {
  orderId: string
  currentStatus: OrderStatus
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-900 border-amber-200/80" },
  { value: "confirmed", label: "Confirmed", color: "bg-sky-50 text-sky-900 border-sky-200/80" },
  { value: "preparing", label: "Preparing", color: "bg-indigo-50 text-indigo-900 border-indigo-200/80" },
  { value: "shipped", label: "Shipped", color: "bg-teal-50 text-teal-900 border-teal-200/80" },
  { value: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-900 border-emerald-200/80" },
  { value: "cancelled", label: "Cancelled", color: "bg-rose-50 text-rose-900 border-rose-200/80" },
]

export default function AdminOrderStatusUpdater({
  orderId,
  currentStatus,
}: AdminOrderStatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)

  const activeOption = statusOptions.find((s) => s.value === status)

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
    <div className="flex items-center gap-3 bg-light p-2.5 px-4 border border-forest/15 shadow-sm rounded-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-forest/50">
        Status:
      </span>
      <div className="relative">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleChange(e.target.value as OrderStatus)}
          className={`appearance-none border text-xs font-semibold uppercase tracking-wider py-1.5 pl-3 pr-8 rounded-xs focus:outline-none cursor-pointer disabled:opacity-50 transition-colors ${
            activeOption?.color || "bg-champagne text-forest border-forest/15"
          }`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-light text-forest font-medium">
              {opt.label}
            </option>
          ))}
        </select>
        {loading ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-forest/60 pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-forest/60 pointer-events-none" />
        )}
      </div>
    </div>
  )
}
