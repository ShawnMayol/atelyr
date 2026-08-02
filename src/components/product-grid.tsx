"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product, Category } from "@/types/database"
import { ChevronDown, SlidersHorizontal, RotateCcw } from "lucide-react"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductCard from "@/components/product-card"
import { getProductUrl, slugify } from "@/lib/utils"

type ProductGridProps = {
  products: (Product & { category: Category })[]
  categories: Category[]
  initialCategory?: string
  initialSort?: string
}

export default function ProductGrid({
  products,
  categories,
  initialCategory,
  initialSort = "latest",
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "")
  const [sortOrder, setSortOrder] = useState(initialSort || "latest")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filter and sort products
  const filtered = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedCategory) {
      const slugTarget = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter((p) => {
        if (!p.category) return p.category_id === selectedCategory
        const catNameSlug = slugify(p.category.name)
        return (
          p.category_id === selectedCategory ||
          catNameSlug === slugTarget ||
          p.category.name === selectedCategory
        )
      })
    }

    // Min Price filter
    if (minPrice && !isNaN(Number(minPrice))) {
      result = result.filter((p) => p.price >= Number(minPrice))
    }

    // Max Price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => p.price <= Number(maxPrice))
    }

    // Sort order
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortOrder === "latest") {
      result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    } else if (sortOrder === "most-sales") {
      result.sort((a, b) => (b.stock || 0) - (a.stock || 0))
    }

    return result
  }, [products, selectedCategory, minPrice, maxPrice, sortOrder])

  const handleResetFilters = () => {
    setSelectedCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortOrder("latest")
  }

  const setPricePreset = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
  }

  return (
    <div className="space-y-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between border-b border-forest/10 pb-4">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="inline-flex items-center gap-2 py-2 px-4 text-xs font-semibold uppercase tracking-wider text-forest"
        >
          <SlidersHorizontal className="size-5" />
        </button>

        {/* Sort Select (Mobile) */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none border border-forest/15 bg-light py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-forest focus:outline-none cursor-pointer"
          >
            <option value="latest">Sort by Latest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="most-sales">Sort by Most Sales</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {/* Left Sidebar (Desktop + Mobile Collapsible) */}
        <aside
          className={`lg:col-span-1 space-y-8 ${
            mobileFilterOpen ? "block" : "hidden lg:block"
          }`}
        >
          {/* Categories Sidebar List */}
          <div className="space-y-4 border-b border-forest/10 pb-6">
            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-forest/50">
              Categories
            </h3>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory === cat.id ||
                  selectedCategory === cat.name ||
                  selectedCategory === slugify(cat.name)
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/${slugify(cat.name)}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`block py-1.5 px-2 transition-colors uppercase tracking-wider font-semibold rounded-xs ${
                        isSelected
                          ? "bg-forest text-ghost-white"
                          : "text-forest/70 hover:text-forest hover:bg-forest/5"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4 border-b border-forest/10 pb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-forest/50">
                Price Range
              </h3>
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => setPricePreset("", "")}
                  className="text-[10px] uppercase font-semibold text-forest/40 hover:text-forest underline"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-forest/40">₱</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-forest/15 bg-light/50 py-1.5 pl-6 pr-2 text-xs text-forest placeholder:text-forest/30 focus:border-forest/40 focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-forest/40">₱</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-forest/15 bg-light/50 py-1.5 pl-6 pr-2 text-xs text-forest placeholder:text-forest/30 focus:border-forest/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setPricePreset("", "1000")}
                className="text-[10px] uppercase font-semibold border border-forest/15 px-2 py-1 text-forest/70 hover:bg-forest/5"
              >
                Under ₱1k
              </button>
              <button
                onClick={() => setPricePreset("1000", "5000")}
                className="text-[10px] uppercase font-semibold border border-forest/15 px-2 py-1 text-forest/70 hover:bg-forest/5"
              >
                ₱1k - ₱5k
              </button>
              <button
                onClick={() => setPricePreset("5000", "10000")}
                className="text-[10px] uppercase font-semibold border border-forest/15 px-2 py-1 text-forest/70 hover:bg-forest/5"
              >
                ₱5k - ₱10k
              </button>
              <button
                onClick={() => setPricePreset("10000", "")}
                className="text-[10px] uppercase font-semibold border border-forest/15 px-2 py-1 text-forest/70 hover:bg-forest/5"
              >
                ₱10k+
              </button>
            </div>
          </div>

          {/* Reset All Filters Button */}
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 w-full justify-center border border-forest/15 py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest/60 hover:text-forest hover:bg-forest/5 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Reset All Filters
          </button>
        </aside>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 xl:col-span-4 space-y-6">
          {/* Top Control Header Bar (Desktop) */}
          <div className="hidden lg:flex items-center justify-between pb-4 border-b border-forest/10">
            <p className="text-xs text-forest/50">
              Showing <span className="font-semibold text-forest">{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}
            </p>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest/50">
                Sort:
              </span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none border border-forest/15 bg-light py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-forest focus:border-forest/40 focus:outline-none cursor-pointer"
                >
                  <option value="latest">Sort by Latest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="most-sales">Sort by Most Sales</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid Listing */}
          {filtered.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-forest/15 space-y-3">
              <p className="text-sm text-forest/60 font-light">
                No products match your filter criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest hover:underline"
              >
                Clear Filters & View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
