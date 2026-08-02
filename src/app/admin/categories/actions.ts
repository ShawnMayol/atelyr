"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCategory(name: string, imageUrl?: string | null) {
  if (!name.trim()) return { success: false, error: "Category name is required." }
  const supabase = await createClient()

  const { error } = await supabase.from("categories").insert({
    name: name.trim(),
    image_url: imageUrl || null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}

export async function updateCategory(id: string, name: string, imageUrl?: string | null) {
  if (!name.trim()) return { success: false, error: "Category name is required." }
  const supabase = await createClient()

  const { error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      image_url: imageUrl || null,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  // Guard Logic: Check if any products are assigned to this category
  const { count, error: countError } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)

  if (countError) {
    return { success: false, error: countError.message }
  }

  if (count && count > 0) {
    return {
      success: false,
      error: `Cannot delete category. There are ${count} active product(s) assigned to it. Please reassign or delete the products first.`,
    }
  }

  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/products")
  revalidatePath("/")
  return { success: true }
}
