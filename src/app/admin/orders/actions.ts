"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { OrderStatus } from "@/types/database"

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin")
  return { success: true }
}
