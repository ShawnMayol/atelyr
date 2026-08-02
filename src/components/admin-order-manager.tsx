"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Order, OrderStatus } from "@/types/database"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { Search, Eye, ChevronDown, Loader2 } from "lucide-react"

type AdminOrderManagerProps = {
  orders: Order[]
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "preparing", label: "Preparing", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "shipped", label: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
]

export default function AdminOrderManager({ orders }: AdminOrderManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const query = search.toLowerCase()
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
      const matchStatus = !selectedStatus || o.status === selectedStatus

      return matchSearch && matchStatus
    })
  }, [orders, search, selectedStatus])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    const res = await updateOrderStatus(orderId, newStatus)
    setUpdatingId(null)

    if (!res.success) {
      alert(res.error || "Failed to update order status.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-forest/15 bg-light py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest/70 focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Order Number</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Total Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {filtered.length > 0 ? (
                filtered.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-champagne/50">
                      <td className="py-3.5 px-4 font-mono font-medium text-forest">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-forest">{order.customer_name}</p>
                        <p className="text-[10px] text-forest/40">{order.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-forest/50">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium uppercase tracking-wider text-[11px]">
                        {order.payment_method.replace(/_/g, " ")}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-forest">
                        ₱{Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`appearance-none border text-[10px] font-semibold tracking-wider uppercase rounded-sm px-2.5 py-1 pr-6 cursor-pointer focus:outline-none disabled:opacity-50 ${
                              statusOptions.find((s) => s.value === order.status)?.color
                            }`}
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id ? (
                            <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 animate-spin text-forest/50 pointer-events-none" />
                          ) : (
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-forest/50 pointer-events-none" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-forest/60 hover:text-forest transition-colors"
                        >
                          <Eye className="size-3.5" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-forest/40">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
