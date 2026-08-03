"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Users } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

export type CustomerItem = {
  name: string
  email: string
  contactNumber: string
  orderCount: number
  totalSpend: number
  role: string
  createdAt: string
}

type AdminCustomerManagerProps = {
  customers: CustomerItem[]
}

const ITEMS_PER_PAGE = 10

export default function AdminCustomerManager({ customers }: AdminCustomerManagerProps) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return customers.filter(
      (c) =>
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.contactNumber.toLowerCase().includes(query)
    )
  }, [customers, search])

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  return (
    <div className="space-y-6">
      {/* Action / Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search by customer name, email address, or contact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 font-semibold">Customer Name</th>
                <th className="py-4 px-5 font-semibold">Email Address</th>
                <th className="py-4 px-5 font-semibold">Contact Number</th>
                <th className="py-4 px-5 font-semibold">Total Orders</th>
                <th className="py-4 px-5 font-semibold">Total Spend</th>
                <th className="py-4 px-5 font-semibold">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-champagne/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-sm text-forest">
                      {customer.name}
                    </td>
                    <td className="py-4 px-5 text-forest/70 font-mono text-xs">
                      {customer.email}
                    </td>
                    <td className="py-4 px-5 text-forest/60 text-xs">
                      {customer.contactNumber}
                    </td>
                    <td className="py-4 px-5 font-medium text-forest text-xs">
                      {customer.orderCount} order(s)
                    </td>
                    <td className="py-4 px-5 font-semibold text-forest text-xs">
                      ₱{customer.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-xs ${
                          customer.role === "customer"
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80"
                            : "bg-amber-50 text-amber-900 border border-amber-200/80"
                        }`}
                      >
                        {customer.role === "guest" ? "Guest Purchaser" : "Customer Account"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-forest/40">
                    <Users className="size-8 mx-auto mb-2 opacity-40" />
                    No customers match your search query.
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
              of <span className="font-semibold text-forest">{filtered.length}</span> customers
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
