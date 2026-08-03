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
    image_url: cat.image_url || null,
    created_at: cat.created_at,
    product_count: Array.isArray(cat.products) ? cat.products.length : 0,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl tracking-tight text-forest">
          Manage Categories
        </h1>
      </div>

      <AdminCategoryManager categories={categoriesWithCounts} />
    </div>
  )
}
