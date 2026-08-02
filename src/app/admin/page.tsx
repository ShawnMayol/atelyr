import { createClient } from "@/lib/supabase/server"
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Parallelize metrics queries
  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { count: totalCustomers },
    { data: salesData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount").neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("id, customer_name, email, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  // Calculate total revenue from non-cancelled orders
  const totalSales = (salesData || []).reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  )

  const metrics = [
    {
      title: "Total Sales",
      value: `₱${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Lifetime revenue (excl. cancelled)",
    },
    {
      title: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingBag,
      description: "All customer orders",
    },
    {
      title: "Pending Orders",
      value: pendingOrders || 0,
      icon: Clock,
      description: "Awaiting processing",
    },
    {
      title: "Completed Orders",
      value: completedOrders || 0,
      icon: CheckCircle,
      description: "Fulfilled & delivered",
    },
    {
      title: "Total Products",
      value: totalProducts || 0,
      icon: Package,
      description: "Catalog item count",
    },
    {
      title: "Total Customers",
      value: totalCustomers || 0,
      icon: Users,
      description: "Registered profiles",
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-2">
          Management
        </p>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          Dashboard Overview
        </h1>
      </div>

      {/* Metrics Grid (6 Summary Cards) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.title}
              className="bg-light p-6 border border-forest/15 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-forest/50">
                  {metric.title}
                </span>
                <div className="p-2.5 bg-champagne rounded-sm">
                  <Icon className="size-4 text-forest/70" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold tracking-tight text-forest">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-forest/40">
                  {metric.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-light border border-forest/15 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-wider uppercase text-forest">
              Recent Orders
            </h2>
            <p className="text-xs text-forest/50">Latest activity from your storefront</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-forest/60 hover:text-forest transition-colors"
          >
            View All Orders
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-champagne/50">
                    <td className="py-3 px-4 font-mono text-forest">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-forest">{order.customer_name}</p>
                      <p className="text-[10px] text-forest/40">{order.email}</p>
                    </td>
                    <td className="py-3 px-4 text-forest/50">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-forest">
                      ₱{Number(order.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-sm ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-champagne text-forest/70"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-forest/40">
                    No orders recorded yet.
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

