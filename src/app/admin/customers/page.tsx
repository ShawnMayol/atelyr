import { createClient } from "@/lib/supabase/server"
import AdminCustomerManager, { type CustomerItem } from "@/components/admin-customer-manager"

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  // Parallelize fetches for profiles and orders
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("id, email, customer_name, contact_number, total_amount, status"),
  ])

  // Aggregate purchase data per email/customer
  const customerMap = new Map<string, CustomerItem>()

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

  // Filter out Admin accounts so only customers appear in directory
  const customerList = Array.from(customerMap.values()).filter(
    (c) => c.role !== "admin"
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl tracking-tight text-forest">
          Customer Directory
        </h1>
      </div>

      <AdminCustomerManager customers={customerList} />
    </div>
  )
}
