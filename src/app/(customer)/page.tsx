import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/types/database"
import { ArrowRight } from "lucide-react"
import ProductCard from "@/components/product-card"
import CategorySlider from "@/components/category-slider"
import { slugify } from "@/lib/utils"

export default async function HomePage() {
  const supabase = await createClient()

  // Parallelize database queries to fetch up to 10 active products
  const [{ data: categories }, { data: featuredProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("products")
      .select("*, categories(id, name), category:categories(id, name)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const normalizedProducts = (featuredProducts || []).map((p: any) => ({
    ...p,
    category: p.category || p.categories || { name: "" },
  })) as (Product & { category: { name: string } })[]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex h-[calc(100svh-64px)] w-full items-center justify-center overflow-hidden bg-black px-6 py-20">
        {/* Background Image with Dark Contrast Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.webp"
            alt="Atelyr Luxury Collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-ghost-white max-w-xl mx-auto">
            Discover timeless pieces from the world&apos;s finest ateliers.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/all"
              className="inline-flex items-center gap-2 bg-champagne px-8 py-3.5 text-xs font-semibold tracking-widest uppercase text-forest transition-colors hover:bg-champagne-dark shadow-sm"
            >
              Shop Collection
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Showcase - Shop by Category Slider */}
      {categories && categories.length > 0 && (
        <section className="mx-auto w-full py-12 overflow-hidden">
          <div className="text-center mb-8 px-6 lg:px-12">
            <h2 className="text-2xl font-light tracking-tight text-forest sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <CategorySlider categories={categories as Category[]} />
        </section>
      )}

      {/* Featured Products */}
      {normalizedProducts.length > 0 && (
        <section className="mx-auto w-full px-6 pb-20 lg:px-12">
          <div className="text-center mb-12 px-6 lg:px-12">
            <h2 className="text-2xl font-light tracking-tight text-forest sm:text-3xl">
              Featured Products
            </h2>
          </div>

          {/* Balanced Even Grid: Spans Full Screen Width Always */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-x-4 gap-y-8 w-full">
            {normalizedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Prominent Shop Collection CTA Button */}
          <div className="mt-14 text-center">
            <Link
              href="/all"
              className="inline-flex items-center gap-3 bg-forest px-10 py-4 text-xs font-semibold tracking-[0.25em] uppercase text-ghost-white transition-all hover:bg-forest-light hover:scale-105 hover:shadow-xl shadow-md cursor-pointer rounded-xs border border-champagne/30"
            >
              Explore Full Collection
              <ArrowRight className="size-4 text-champagne" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
