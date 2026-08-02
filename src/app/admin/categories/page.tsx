import { createClient } from "@/lib/supabase/server"
import AdminCategoryManager from "@/components/admin-category-manager"

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  // Fetch categories and assigned product counts
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(id)")
    .order("name")

  const categoriesWithCounts = (categories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    created_at: cat.created_at,
    product_count: Array.isArray(cat.products) ? cat.products.length : 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-2">
          Management
        </p>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          Categories
        </h1>
      </div>

      <AdminCategoryManager categories={categoriesWithCounts} />
    </div>
  )
}
