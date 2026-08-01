"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product, Category } from "@/types/database"
import { Search, ChevronDown } from "lucide-react"
import AddToCartButton from "@/components/add-to-cart-button"

type ProductGridProps = {
  products: (Product & { category: Category })[]
  categories: Category[]
  initialCategory?: string
  initialSearch?: string
  initialSort?: string
}

export default function ProductGrid({
  products,
  categories,
  initialCategory,
  initialSearch,
  initialSort,
}: ProductGridProps) {
  const [search, setSearch] = useState(initialSearch || "")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "")
  const [sortOrder, setSortOrder] = useState(initialSort || "")

  const filtered = useMemo(() => {
    let result = [...products]

    // Search filter
    if (search) {
      const query = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.name.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory) {
      const slugTarget = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, "")
      result = result.filter((p) => {
        if (!p.category) return p.category_id === selectedCategory
        const catNameSlug = p.category.name.toLowerCase().replace(/[^a-z0-9]/g, "")
        return (
          p.category_id === selectedCategory ||
          catNameSlug === slugTarget ||
          p.category.name === selectedCategory
        )
      })
    }

    // Price sort
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [products, search, selectedCategory, sortOrder])

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10 pb-6 border-b border-forest/10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-champagne-light py-2.5 pl-10 pr-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/30 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Category filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none border border-forest/15 bg-champagne-light py-2.5 pl-4 pr-10 text-xs font-medium tracking-wide uppercase text-forest/70 focus:border-forest/30 focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
          </div>

          {/* Price sort */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none border border-forest/15 bg-champagne-light py-2.5 pl-4 pr-10 text-xs font-medium tracking-wide uppercase text-forest/70 focus:border-forest/30 focus:outline-none cursor-pointer"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-forest/50 mb-6">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-forest/50">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/products/${product.id}`}>
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
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-sm font-medium text-forest group-hover:underline underline-offset-4">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-forest/70">
                    ₱{product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  {product.stock <= 0 && (
                    <span className="text-[10px] font-medium tracking-wide uppercase text-red-500">
                      Out of Stock
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="text-[10px] font-medium tracking-wide uppercase text-amber-600">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/products/${product.id}`}
                  className="text-xs font-semibold tracking-widest uppercase text-forest/60 transition-colors hover:text-forest"
                >
                  View Details
                </Link>
                <span className="text-forest/20">|</span>
                <AddToCartButton product={product} variant="minimal" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
