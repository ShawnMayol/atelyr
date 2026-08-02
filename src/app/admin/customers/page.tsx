import { createClient } from "@/lib/supabase/server"
import { Users, ShoppingBag, DollarSign } from "lucide-react"

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  // Parallelize fetches for profiles and orders
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("id, email, customer_name, contact_number, total_amount, status"),
  ])

  // Aggregate purchase data per email/customer
  const customerMap = new Map<
    string,
    {
      name: string
      email: string
      contactNumber: string
      orderCount: number
      totalSpend: number
      role: string
      createdAt: string
    }
  >()

  // 1. Process profiles first
  ;(profiles || []).forEach((p) => {
    customerMap.set(p.email.toLowerCase(), {
      name: p.email.split("@")[0],
      email: p.email,
      contactNumber: "N/A",
      orderCount: 0,
      totalSpend: 0,
      role: p.role || "customer",
      createdAt: p.created_at,
    })
  })

  // 2. Aggregate orders (including guest checkout customers)
  ;(orders || []).forEach((o) => {
    const key = o.email.toLowerCase()
    const existing = customerMap.get(key)
    const orderTotal = o.status !== "cancelled" ? Number(o.total_amount || 0) : 0

    if (existing) {
      existing.orderCount += 1
      existing.totalSpend += orderTotal
      if (o.customer_name && existing.name === o.email.split("@")[0]) {
        existing.name = o.customer_name
      }
      if (o.contact_number && existing.contactNumber === "N/A") {
        existing.contactNumber = o.contact_number
      }
    } else {
      customerMap.set(key, {
        name: o.customer_name || key.split("@")[0],
        email: o.email,
        contactNumber: o.contact_number || "N/A",
        orderCount: 1,
        totalSpend: orderTotal,
        role: "guest",
        createdAt: new Date().toISOString(),
      })
    }
  })

  const customerList = Array.from(customerMap.values())

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-2">
          Management
        </p>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          Customer Directory
        </h1>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-light p-6 border border-forest/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-forest/50">
              Total Customers
            </p>
            <p className="text-2xl font-semibold text-forest mt-2">
              {customerList.length}
            </p>
          </div>
          <div className="p-3 bg-champagne rounded-sm text-forest/70">
            <Users className="size-5" />
          </div>
        </div>

        <div className="bg-light p-6 border border-forest/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-forest/50">
              Registered Accounts
            </p>
            <p className="text-2xl font-semibold text-forest mt-2">
              {customerList.filter((c) => c.role !== "guest").length}
            </p>
          </div>
          <div className="p-3 bg-champagne rounded-sm text-forest/70">
            <ShoppingBag className="size-5" />
          </div>
        </div>

        <div className="bg-light p-6 border border-forest/15 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-forest/50">
              Average Customer Spend
            </p>
            <p className="text-2xl font-semibold text-forest mt-2">
              ₱{(
                customerList.reduce((acc, c) => acc + c.totalSpend, 0) /
                  (customerList.length || 1)
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-3 bg-champagne rounded-sm text-forest/70">
            <DollarSign className="size-5" />
          </div>
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-4 font-semibold">Email Address</th>
                <th className="py-3 px-4 font-semibold">Contact Number</th>
                <th className="py-3 px-4 font-semibold">Total Orders</th>
                <th className="py-3 px-4 font-semibold">Total Spend</th>
                <th className="py-3 px-4 font-semibold">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {customerList.length > 0 ? (
                customerList.map((customer) => (
                  <tr key={customer.email} className="hover:bg-champagne/50">
                    <td className="py-3.5 px-4 font-medium text-forest">
                      {customer.name}
                    </td>
                    <td className="py-3.5 px-4 text-forest/60 font-mono">
                      {customer.email}
                    </td>
                    <td className="py-3.5 px-4 text-forest/50">
                      {customer.contactNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-forest">
                      {customer.orderCount} order(s)
                    </td>
                    <td className="py-3.5 px-4 font-medium text-forest">
                      ₱{customer.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${
                          customer.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : customer.role === "customer"
                            ? "bg-green-100 text-green-800"
                            : "bg-champagne text-forest/60"
                        }`}
                      >
                        {customer.role === "guest" ? "Guest Purchaser" : customer.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-forest/40">
                    No customers found in database.
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
