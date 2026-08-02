import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/types/database"
import { ArrowRight } from "lucide-react"
import AddToCartButton from "@/components/add-to-cart-button"

import { slugify, getProductUrl } from "@/lib/utils"

export default async function HomePage() {
  const supabase = await createClient()

  // Parallelize database queries to minimize latency
  const [{ data: categories }, { data: featuredProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name), category:categories(id, name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const normalizedProducts = (featuredProducts || []).map((p: any) => ({
    ...p,
    category: p.category || p.categories || { name: "" },
  })) as (Product & { category: { name: string } })[]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex items-center justify-center bg-forest px-6 py-32 lg:py-48">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-ghost-white/70 mb-6">
            Curated Luxury Essentials
          </p>
          <h1 className="text-4xl font-light tracking-tight text-ghost-white sm:text-5xl lg:text-6xl">
            Craftsmanship Over Logos,
            <br />
            <span className="font-semibold">Quality Over Trend</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ghost-white/70 max-w-xl mx-auto">
            Discover timeless pieces from the world&apos;s finest ateliers.
            Understated elegance for the discerning individual.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={categories && categories.length > 0 ? `/${slugify(categories[0].name)}` : "#"}
              className="inline-flex items-center gap-2 bg-champagne px-8 py-3.5 text-xs font-semibold tracking-widest uppercase text-forest transition-colors hover:bg-champagne-dark"
            >
              Shop Collection
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      {categories && categories.length > 0 && (
        <section className="mx-auto w-full px-6 py-20 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-3">
              Browse By
            </p>
            <h2 className="text-3xl font-light tracking-tight text-forest">
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {(categories as Category[]).map((category) => (
              <Link
                key={category.id}
                href={`/${slugify(category.name)}`}
                className="group relative flex h-48 items-end overflow-hidden bg-champagne p-6 transition-all hover:bg-champagne-dark"
              >
                <div>
                  <h3 className="text-sm font-semibold tracking-wide uppercase text-forest">
                    {category.name}
                  </h3>
                  <span className="mt-1 flex items-center gap-1 text-xs text-forest/50 transition-colors group-hover:text-forest">
                    Explore
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {normalizedProducts.length > 0 && (
        <section className="mx-auto w-full px-6 py-20 lg:px-12 border-t border-forest/10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-3">
                Featured
              </p>
              <h2 className="text-3xl font-light tracking-tight text-forest">
                New Arrivals
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {normalizedProducts.map((product) => (
              <div key={product.id} className="group">
                  <Link href={getProductUrl(product)}>
                    <div className="aspect-[3/4] w-full overflow-hidden bg-champagne">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={600}
                          height={800}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-forest/30">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-forest/50">
                      {product.category?.name}
                    </p>
                    <Link href={getProductUrl(product)}>
                      <h3 className="text-sm font-medium text-forest group-hover:underline underline-offset-4">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-forest/70">
                      ₱{product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="mt-3">
                    <AddToCartButton product={product} variant="minimal" />
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  )
}
