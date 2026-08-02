"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ProductStatus } from "@/types/database"

export type ProductFormData = {
  name: string
  description: string
  price: number
  stock: number
  category_id: string
  image_url: string
  status: ProductStatus
}

export async function createProduct(data: ProductFormData) {
  const supabase = await createClient()

  const { error } = await supabase.from("products").insert({
    name: data.name,
    description: data.description || null,
    price: Number(data.price),
    stock: Number(data.stock),
    category_id: data.category_id,
    image_url: data.image_url || null,
    status: data.status,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      description: data.description || null,
      price: Number(data.price),
      stock: Number(data.stock),
      category_id: data.category_id,
      image_url: data.image_url || null,
      status: data.status,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath(`/products/${id}`)
  revalidatePath("/")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}
