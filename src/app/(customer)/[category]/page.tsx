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

  // Fetch categories and active products in parallel
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name), category:categories(id, name)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ])

  const allCategories = (categories as Category[]) || []

  // Match category by slugified name
  const currentCategory = allCategories.find(
    (cat) => slugify(cat.name) === categorySlug
  )

  if (!currentCategory) {
    notFound()
  }

  // Filter products for this category
  const categoryProducts = (products || [])
    .filter((p: any) => p.category_id === currentCategory.id)
    .map((p: any) => ({
      ...p,
      category: p.category || p.categories || { id: currentCategory.id, name: currentCategory.name },
    })) as (Product & { category: Category })[]

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 space-y-8">
      {/* Product Grid */}
      <ProductGrid
        products={categoryProducts}
        categories={allCategories}
        initialCategory={currentCategory.id}
      />
    </div>
  )
}
