"use server"

import { createClient } from "@/lib/supabase/server"
import type { PaymentMethod } from "@/types/database"

type CheckoutData = {
  customerName: string
  email: string
  contactNumber: string
  address: string
  paymentMethod: PaymentMethod
  notes: string
  items: {
    productId: string
    quantity: number
    priceAtPurchase: number
  }[]
  totalAmount: number
}

export async function createOrder(data: CheckoutData) {
  const supabase = await createClient()

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customerName,
      email: data.email,
      contact_number: data.contactNumber || null,
      address: data.address,
      payment_method: data.paymentMethod,
      total_amount: data.totalAmount,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (orderError || !order) {
    return { success: false, error: orderError?.message || "Failed to create order." }
  }

  // Insert order items
  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price_at_purchase: item.priceAtPurchase,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    return { success: false, error: itemsError.message }
  }

  return { success: true, orderId: order.id }
}
