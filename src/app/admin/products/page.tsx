import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/types/database"
import AdminProductManager from "@/components/admin-product-manager"

export default async function AdminProductsPage() {
  const supabase = await createClient()

  // Parallelize database queries
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name), category:categories(id, name)")
      .order("created_at", { ascending: false }),
  ])

  const normalizedProducts = (products || []).map((p: any) => ({
    ...p,
    category: p.category || p.categories || { id: p.category_id, name: "" },
  })) as (Product & { category: Category })[]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-2">
          Management
        </p>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          Product Catalog
        </h1>
      </div>

      <AdminProductManager
        products={normalizedProducts}
        categories={(categories as Category[]) || []}
      />
    </div>
  )
}
