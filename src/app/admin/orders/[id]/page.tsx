import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Order, OrderItem, Product } from "@/types/database"
import { ArrowLeft, MapPin, Mail, Phone, User, Calendar, CreditCard, FileText } from "lucide-react"
import AdminOrderStatusUpdater from "@/components/admin-order-status-updater"

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch order with order_items and joined products
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  const typedOrder = order as Order & {
    order_items: (OrderItem & { product: Product })[]
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-forest/50 hover:text-forest transition-colors mb-4"
        >
          <ArrowLeft className="size-3.5" />
          Back to Orders
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-1">
              Order Details
            </p>
            <h1 className="text-2xl sm:text-3xl font-mono font-medium tracking-tight text-forest">
              #{typedOrder.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>

          <AdminOrderStatusUpdater
            orderId={typedOrder.id}
            currentStatus={typedOrder.status}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Ordered Items & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-light border border-forest/15 shadow-sm p-5 sm:p-6 space-y-6">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-forest border-b border-forest/15 pb-4">
              Ordered Products ({typedOrder.order_items?.length || 0})
            </h2>

            <div className="divide-y divide-forest/15">
              {typedOrder.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                  <div className="size-16 bg-champagne flex-shrink-0 overflow-hidden rounded-xs border border-forest/15">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name || "Product"}
                        width={64}
                        height={64}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[9px] text-forest/40">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-sm text-forest">{item.product?.name || "Product"}</p>
                      <p className="text-forest/60 mt-0.5">
                        Qty: {item.quantity} × ₱{Number(item.price_at_purchase).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <p className="font-semibold text-forest text-sm">
                      ₱{(Number(item.price_at_purchase) * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Total Summary */}
            <div className="border-t border-forest/15 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-forest/60">
                <span>Subtotal</span>
                <span>₱{Number(typedOrder.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-forest/60">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between border-t border-forest/15 pt-3 text-sm font-semibold text-forest">
                <span>Total Amount</span>
                <span>₱{Number(typedOrder.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Always Display Customer Notes */}
          <div className="bg-light border border-forest/15 shadow-sm p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-forest">
              <FileText className="size-4 text-forest/50" />
              Customer Notes
            </div>
            <div className="bg-champagne/40 border border-forest/10 p-3.5 rounded-xs text-xs">
              {typedOrder.notes && typedOrder.notes.trim() !== "" ? (
                <p className="text-forest/80 leading-relaxed font-normal">
                  {typedOrder.notes}
                </p>
              ) : (
                <p className="text-forest/40 italic">
                  No notes provided for this order.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-light border border-forest/15 shadow-sm p-5 sm:p-6 space-y-4 text-xs">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-forest border-b border-forest/15 pb-4">
              Customer Information
            </h2>

            <div className="flex items-start gap-3">
              <User className="size-4 text-forest/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Name</p>
                <p className="font-semibold text-forest mt-0.5">{typedOrder.customer_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="size-4 text-forest/40 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Email</p>
                <p className="font-semibold text-forest mt-0.5 truncate">{typedOrder.email}</p>
              </div>
            </div>

            {typedOrder.contact_number && (
              <div className="flex items-start gap-3">
                <Phone className="size-4 text-forest/40 mt-0.5 shrink-0" />
                <div>
                  <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Contact</p>
                  <p className="font-semibold text-forest mt-0.5">{typedOrder.contact_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-forest/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Delivery Address</p>
                <p className="font-medium text-forest leading-relaxed mt-0.5">{typedOrder.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-forest/15 pt-4">
              <CreditCard className="size-4 text-forest/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Payment Method</p>
                <p className="font-semibold uppercase tracking-wider text-forest mt-0.5">
                  {typedOrder.payment_method.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-forest/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-forest/50 uppercase tracking-wider text-[10px] font-semibold">Order Date</p>
                <p className="font-semibold text-forest mt-0.5">
                  {new Date(typedOrder.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
