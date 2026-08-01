import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/types/database"
import ProductGrid from "@/components/product-grid"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Parallelize fetches to cut network latency in half
  const [{ data: categories, error: catError }, { data: products, error: prodError }] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("products")
        .select("*, categories(id, name), category:categories(id, name)")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ])

  if (catError || prodError) {
    console.error("Supabase Products Fetch Error:", prodError || catError)
  }

  const normalizedProducts = (products || []).map((p: any) => ({
    ...p,
    category: p.category || p.categories || { id: p.category_id, name: "" },
  })) as (Product & { category: Category })[]

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-3">
          Collection
        </p>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          All Products
        </h1>
      </div>

      {(prodError || catError) && (
        <div className="mb-8 rounded-md bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800">
          <p className="font-semibold mb-1">Database Query Warning:</p>
          <p>{prodError?.message || catError?.message || "Failed to load products from database."}</p>
        </div>
      )}

      <ProductGrid
        products={normalizedProducts}
        categories={(categories as Category[]) || []}
        initialCategory={params.category}
        initialSearch={params.q}
        initialSort={params.sort}
      />
    </div>
  )
}
