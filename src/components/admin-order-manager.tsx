"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import type { Order, OrderStatus, PaymentMethod } from "@/types/database"
import { updateOrderStatus } from "@/app/admin/orders/actions"
import { Search, Eye, ChevronDown, Loader2, Filter, ShoppingBag } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

type AdminOrderManagerProps = {
  orders: Order[]
}

const ITEMS_PER_PAGE = 10

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-amber-50 text-amber-900 border-amber-200/80" },
  { value: "confirmed", label: "Confirmed", color: "bg-sky-50 text-sky-900 border-sky-200/80" },
  { value: "preparing", label: "Preparing", color: "bg-indigo-50 text-indigo-900 border-indigo-200/80" },
  { value: "shipped", label: "Shipped", color: "bg-teal-50 text-teal-900 border-teal-200/80" },
  { value: "completed", label: "Completed", color: "bg-emerald-50 text-emerald-900 border-emerald-200/80" },
  { value: "cancelled", label: "Cancelled", color: "bg-rose-50 text-rose-900 border-rose-200/80" },
]

const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

export default function AdminOrderManager({ orders }: AdminOrderManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedStatus, selectedPaymentMethod])

  const activeFilterCount =
    (selectedStatus ? 1 : 0) + (selectedPaymentMethod ? 1 : 0)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const query = search.toLowerCase()
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(query) ||
        o.customer_name.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query)
      const matchStatus = !selectedStatus || o.status === selectedStatus
      const matchPayment =
        !selectedPaymentMethod || o.payment_method === selectedPaymentMethod

      return matchSearch && matchStatus && matchPayment
    })
  }, [orders, search, selectedStatus, selectedPaymentMethod])

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

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
      {/* Action / Search & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>

        {/* Filter Popover Trigger & Dropdown */}
        <div className="flex items-center gap-3 justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 border py-2.5 px-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
                isFilterOpen || activeFilterCount > 0
                  ? "border-forest bg-champagne text-forest"
                  : "border-forest/15 bg-light text-forest/70 hover:border-forest/30 hover:text-forest"
              }`}
              title="Filter Orders"
            >
              <Filter className="size-4" />
            </button>

            {/* Filter Popover Dropdown */}
            {isFilterOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsFilterOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 z-30 w-56 bg-light border border-forest/15 shadow-xl p-4 space-y-4 rounded-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-forest/15 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                      Filter Orders
                    </span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatus("")
                          setSelectedPaymentMethod("")
                        }}
                        className="text-[11px] font-medium text-forest/60 hover:text-forest underline transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Order Status Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest/50">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-forest/15 bg-light py-2 px-2.5 text-xs font-medium text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest/50">
                      Payment Method
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-full border border-forest/15 bg-light py-2 px-2.5 text-xs font-medium text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
                    >
                      <option value="">All Payment Methods</option>
                      {paymentMethodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 font-semibold">Order Number</th>
                <th className="py-4 px-5 font-semibold">Customer</th>
                <th className="py-4 px-5 font-semibold">Date</th>
                <th className="py-4 px-5 font-semibold">Payment Method</th>
                <th className="py-4 px-5 font-semibold">Total Amount</th>
                <th className="py-4 px-5 font-semibold">Status</th>
                <th className="py-4 px-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-champagne/50 transition-colors">
                      <td className="py-4 px-5 font-mono font-medium text-forest text-xs">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-forest text-xs">{order.customer_name}</p>
                        <p className="text-[10px] text-forest/40 mt-0.5">{order.email}</p>
                      </td>
                      <td className="py-4 px-5 text-forest/50 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 font-medium uppercase tracking-wider text-[11px] text-forest/70">
                        {order.payment_method.replace(/_/g, " ")}
                      </td>
                      <td className="py-4 px-5 font-semibold text-forest text-xs">
                        ₱{Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-5">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`appearance-none border text-[10px] font-semibold tracking-wider uppercase rounded-xs px-2.5 py-1 pr-6 cursor-pointer focus:outline-none disabled:opacity-50 ${
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
                      <td className="py-4 px-5 text-right">
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
                  <td colSpan={7} className="py-16 text-center text-forest/40">
                    <ShoppingBag className="size-8 mx-auto mb-2 opacity-40" />
                    No orders match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Shadcn Pagination Bar */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-forest/15 bg-light">
            <p className="text-xs text-forest/60">
              Showing{" "}
              <span className="font-semibold text-forest">
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-forest">
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-forest">{filtered.length}</span> orders
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="pt-0 justify-end"
            />
          </div>
        )}
      </div>
    </div>
  )
}
