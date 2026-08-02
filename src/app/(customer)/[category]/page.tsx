import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Product, Category } from "@/types/database"
import { slugify } from "@/lib/utils"
import ProductGrid from "@/components/product-grid"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: categorySlug } = await params
  const supabase = await createClient()

  // Fetch categories, active products, and order sales counts in parallel
  const [{ data: categories }, { data: products }, { data: orderItems }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name), category:categories(id, name)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase.from("order_items").select("product_id, quantity"),
  ])

  const allCategories = (categories as Category[]) || []

  // Compute exact sales count per product from completed order items
  const salesMap: Record<string, number> = {}
  if (orderItems) {
    for (const item of orderItems) {
      if (item.product_id) {
        salesMap[item.product_id] = (salesMap[item.product_id] || 0) + (item.quantity || 1)
      }
    }
  }

  const isAllProducts = categorySlug === "all" || categorySlug === "all-products"

  // Match category by slugified name
  const currentCategory = isAllProducts
    ? { id: "all", name: "All Products" }
    : allCategories.find((cat) => slugify(cat.name) === categorySlug)

  if (!currentCategory) {
    notFound()
  }

  // Filter products for this category (or return all if "All Products")
  const rawProducts = isAllProducts
    ? (products || [])
    : (products || []).filter((p: any) => p.category_id === currentCategory.id)

  const categoryProducts = rawProducts.map((p: any) => ({
    ...p,
    sales_count: salesMap[p.id] || 0,
    category: p.category || p.categories || { id: p.category_id, name: "" },
  })) as (Product & { category: Category; sales_count?: number })[]

  return (
    <div className="w-full px-6 py-10 lg:px-12 space-y-8">
      {/* Product Grid */}
      <ProductGrid
        products={categoryProducts}
        categories={allCategories}
        initialCategory={currentCategory.id}
        initialSort="most-sales"
      />
    </div>
  )
}
