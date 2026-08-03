import { createClient } from "@/lib/supabase/server"
import type { Order } from "@/types/database"
import AdminOrderManager from "@/components/admin-order-manager"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Fetch all orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl tracking-tight text-forest">
          Order Management
        </h1>
      </div>

      <AdminOrderManager orders={(orders as Order[]) || []} />
    </div>
  )
}
