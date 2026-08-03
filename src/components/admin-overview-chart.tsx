"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type ChartDataPoint = {
  date: string
  sales: number
  orders: number
}

const chartConfig = {
  views: {
    label: "Overview",
  },
  sales: {
    label: "Sales",
    color: "#1b3c29",
  },
  orders: {
    label: "Orders",
    color: "#1b3c29",
  },
} satisfies ChartConfig

const chartColors: Record<"sales" | "orders", string> = {
  sales: "#1b3c29",
  orders: "#1b3c29",
}

export function AdminOverviewChart({ data }: { data: ChartDataPoint[] }) {
  const [activeChart, setActiveChart] =
    React.useState<"sales" | "orders">("sales")

  const total = React.useMemo(
    () => ({
      sales: data.reduce((acc, curr) => acc + curr.sales, 0),
      orders: data.reduce((acc, curr) => acc + curr.orders, 0),
    }),
    [data]
  )

  return (
    <Card className="py-4 sm:py-0 bg-light ring-0 border border-forest/15 shadow-sm">
      <CardHeader className="flex flex-col items-stretch border-b border-forest/15 p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0 py-4">
          <CardTitle className="font-semibold tracking-wider uppercase text-forest">
            Performance Overview
          </CardTitle>
          <CardDescription className="text-xs text-forest/50">
            Sales and orders analysis for the past 30 days
          </CardDescription>
        </div>
        <div className="flex divide-x divide-forest/15">
          {(["sales", "orders"] as const).map((key) => {
            const chart = key as "sales" | "orders"
            return (
              <button
                key={chart}
                type="button"
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left border-forest/15 border-l transition-colors data-[active=true]:bg-champagne/60 cursor-pointer sm:px-8"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-forest/60">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold text-forest sm:text-2xl font-mono">
                  {key === "sales"
                    ? `₱${total.sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : total.orders.toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px] bg-light border border-forest/15"
                    nameKey={activeChart}
                    labelFormatter={(value) => {
                      if (!value) return ""
                      return new Date(String(value)).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    formatter={(val) => {
                      const num = Number(val || 0)
                      if (activeChart === "sales") {
                        return `₱${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      }
                      return num.toLocaleString()
                    }}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartColors[activeChart]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-xs text-forest/40">
            No completed orders data available yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
