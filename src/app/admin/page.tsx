import { createClient } from "@/lib/supabase/server"
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  Users,
  PhilippinePesoIcon,
} from "lucide-react"
import {
  AdminOverviewChart,
  type ChartDataPoint,
} from "@/components/admin-overview-chart"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Parallelize queries
  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: pendingOrders },
    { count: completedOrders },
    { data: customerOrdersData },
    { data: salesData },
    { data: allOrdersData },
    { data: completedOrdersData },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("orders").select("email"),
    supabase.from("orders").select("total_amount").eq("status", "completed"),
    supabase
      .from("orders")
      .select("created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("total_amount, created_at, completed_at")
      .eq("status", "completed")
      .order("created_at", { ascending: true }),
  ])

  // Count unique customers who placed at least one order
  const totalCustomers = new Set(
    (customerOrdersData || []).map((order) => order.email.toLowerCase().trim())
  ).size

  // Calculate total revenue from non-cancelled orders
  const totalSales = (salesData || []).reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  )

  // Aggregate daily sales (completed orders) and daily orders count (order creation date)
  const chartMap: Record<string, { sales: number; orders: number }> = {}

  // 1. Orders count per day based on order creation date
  ;(allOrdersData || []).forEach((order) => {
    const dateKey = new Date(order.created_at).toISOString().split("T")[0]
    if (!chartMap[dateKey]) {
      chartMap[dateKey] = { sales: 0, orders: 0 }
    }
    chartMap[dateKey].orders += 1
  })

  // 2. Sales revenue per day calculated for completed orders
  ;(completedOrdersData || []).forEach((order) => {
    const dateSource = order.completed_at || order.created_at
    const dateKey = new Date(dateSource).toISOString().split("T")[0]
    if (!chartMap[dateKey]) {
      chartMap[dateKey] = { sales: 0, orders: 0 }
    }
    chartMap[dateKey].sales += Number(order.total_amount || 0)
  })

  const chartData: ChartDataPoint[] = Object.entries(chartMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, values]) => ({
      date,
      sales: values.sales,
      orders: values.orders,
    }))

  const metrics = [
    {
      title: "Pending Orders",
      value: pendingOrders || 0,
      icon: Clock,
    },
    {
      title: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingBag,
    },
    {
      title: "Completed Orders",
      value: completedOrders || 0,
      icon: CheckCircle,
    },
    {
      title: "Total Products",
      value: totalProducts || 0,
      icon: Package,
    },
    {
      title: "Total Customers",
      value: totalCustomers || 0,
      icon: Users,
    },
    {
      title: "Total Sales",
      value: `₱${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: PhilippinePesoIcon,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl tracking-tight text-forest">
          Dashboard Overview
        </h1>
      </div>

      {/* Metrics Grid (2 columns on small screens, 3 on desktop) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon

          return (
            <div
              key={metric.title}
              className="bg-light p-5 sm:p-6 border border-forest/15 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-forest/50">
                  {metric.title}
                </span>
                <div className="p-2 sm:p-2.5 bg-champagne rounded-sm shrink-0">
                  <Icon className="size-4 text-forest/70" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xl sm:text-2xl font-semibold tracking-tight text-forest">
                  {metric.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Interactive Line Chart */}
      <AdminOverviewChart data={chartData} />
    </div>
  )
}
