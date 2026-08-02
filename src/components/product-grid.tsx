"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { Product, Category } from "@/types/database"
import { ChevronDown, SlidersHorizontal, RotateCcw, X } from "lucide-react"
import ProductCard from "@/components/product-card"
import { slugify } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"

type ProductWithSales = Product & {
  category: Category
  sales_count?: number
}

type ProductGridProps = {
  products: ProductWithSales[]
  categories: Category[]
  initialCategory?: string
  initialSort?: string
}

const ITEMS_PER_PAGE = 10

export default function ProductGrid({
  products,
  categories,
  initialCategory = "all",
  initialSort = "most-sales",
}: ProductGridProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const urlMin = searchParams.get("min") || ""
  const urlMax = searchParams.get("max") || ""
  const urlSearch = searchParams.get("search") || ""

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all")
  const [sortOrder, setSortOrder] = useState(initialSort || "most-sales")
  const [minPrice, setMinPrice] = useState<string>(urlMin)
  const [maxPrice, setMaxPrice] = useState<string>(urlMax)
  const [tempMinPrice, setTempMinPrice] = useState<string>(urlMin)
  const [tempMaxPrice, setTempMaxPrice] = useState<string>(urlMax)
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Sync state with URL search parameters (?min, ?max, ?search)
  useEffect(() => {
    const minVal = searchParams.get("min") || ""
    const maxVal = searchParams.get("max") || ""
    const searchVal = searchParams.get("search") || ""

    setMinPrice(minVal)
    setMaxPrice(maxVal)
    setTempMinPrice(minVal)
    setTempMaxPrice(maxVal)
    setSearchQuery(searchVal)
  }, [searchParams])

  // Reset pagination page whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, minPrice, maxPrice, searchQuery, sortOrder])

  // Update URL parameters helper
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value.trim() !== "") {
        params.set(key, value.trim())
      } else {
        params.delete(key)
      }
    })
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  // Helper to preserve active query filters (?min, ?max, ?search) when navigating between category routes
  const getCategoryHref = (catSlug: string) => {
    const queryString = searchParams.toString()
    return queryString ? `/${catSlug}?${queryString}` : `/${catSlug}`
  }

  // Apply Price Filter Button click (updates ?min and ?max in URL)
  const handleApplyPriceFilter = () => {
    updateUrlParams({
      min: tempMinPrice,
      max: tempMaxPrice,
    })
  }

  // Clear individual active filters from URL
  const clearMinPriceFilter = () => {
    setTempMinPrice("")
    updateUrlParams({ min: null })
  }

  const clearMaxPriceFilter = () => {
    setTempMaxPrice("")
    updateUrlParams({ max: null })
  }

  const clearSearchFilter = () => {
    updateUrlParams({ search: null })
  }

  // Clear all filters resets query parameters while preserving the current category route
  const handleResetAllFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setTempMinPrice("")
    setTempMaxPrice("")
    setSearchQuery("")
    setSortOrder("most-sales")
    setMobileFilterOpen(false)
    router.push(pathname)
  }

  // Filter and sort products
  const filtered = useMemo(() => {
    let result = [...products]

    // Category filter (if not "all")
    if (selectedCategory && selectedCategory !== "all") {
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

    // Search query filter (matches name, category name, or description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q)
        const catMatch = p.category?.name.toLowerCase().includes(q)
        const descMatch = p.description?.toLowerCase().includes(q)
        return nameMatch || catMatch || descMatch
      })
    }

    // Min Price filter
    if (minPrice && !isNaN(Number(minPrice))) {
      result = result.filter((p) => Number(p.price) >= Number(minPrice))
    }

    // Max Price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => Number(p.price) <= Number(maxPrice))
    }

    // Sort order: Most Sales (Default), Price Low-High, Price High-Low
    if (sortOrder === "most-sales") {
      result.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
    } else if (sortOrder === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price))
    }

    return result
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, sortOrder])

  // Pagination calculation (Max 10 products per page)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Active category header name helper
  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategory || slugify(c.name) === selectedCategory
  )
  const activeCategoryName = selectedCategory === "all" ? "All Products" : (activeCategoryObj?.name || selectedCategory)

  // Active filter checks (Category is a route, NOT an active filter badge)
  const hasActiveFilters = minPrice !== "" || maxPrice !== "" || searchQuery !== ""

  // Shared Sidebar Filters Component
  const renderSidebarContent = () => (
    <div className="space-y-2">
      {/* Categories Sidebar List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-forest/50">
          Categories
        </h3>
        <ul className="space-y-1 text-xs">
          {/* All Products Option */}
          <li>
            <Link
              href={getCategoryHref("all")}
              onClick={() => {
                setSelectedCategory("all")
                setMobileFilterOpen(false)
              }}
              className={`block py-1.5 px-2.5 transition-colors uppercase tracking-wider font-semibold rounded-xs ${
                selectedCategory === "all" || selectedCategory === ""
                  ? "bg-forest text-ghost-white"
                  : "text-forest/70 hover:text-forest hover:bg-forest/5"
              }`}
            >
              All Products
            </Link>
          </li>

          {categories.map((cat) => {
            const catSlug = slugify(cat.name)
            const isSelected =
              selectedCategory === cat.id ||
              selectedCategory === cat.name ||
              selectedCategory === catSlug

            return (
              <li key={cat.id}>
                <Link
                  href={getCategoryHref(catSlug)}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setMobileFilterOpen(false)
                  }}
                  className={`block py-1.5 px-2.5 transition-colors uppercase tracking-wider font-semibold rounded-xs ${
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

      {/* Price Range Filter (URL synced ?min & ?max) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-forest/50">
          Price Range
        </h3>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-forest/40">₱</span>
            <input
              type="number"
              placeholder="Min"
              value={tempMinPrice}
              onChange={(e) => setTempMinPrice(e.target.value)}
              className="w-full border border-forest/15 bg-light py-1.5 pl-6 pr-2 text-xs text-forest placeholder:text-forest/30 focus:border-forest/40 focus:outline-none"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-forest/40">₱</span>
            <input
              type="number"
              placeholder="Max"
              value={tempMaxPrice}
              onChange={(e) => setTempMaxPrice(e.target.value)}
              className="w-full border border-forest/15 bg-light py-1.5 pl-6 pr-2 text-xs text-forest placeholder:text-forest/30 focus:border-forest/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Apply Price Filter Button */}
        <button
          onClick={() => {
            handleApplyPriceFilter()
            setMobileFilterOpen(false)
          }}
          className="w-full py-2 px-3 bg-forest text-ghost-white text-xs font-semibold uppercase tracking-wider hover:bg-forest-light transition-colors cursor-pointer rounded-xs shadow-xs"
        >
          Apply Filter
        </button>
      </div>

      {/* Clear All Filters Button */}
      <button
        onClick={handleResetAllFilters}
        className="flex items-center gap-2 w-full justify-center border border-forest/15 py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest/70 hover:text-forest hover:bg-forest/5 transition-colors cursor-pointer"
      >
        <RotateCcw className="size-3.5" />
        Clear All Filters
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between pb-2">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-2 py-2 px-4 text-xs font-semibold uppercase tracking-wider text-forest border border-forest/15 rounded-xs cursor-pointer"
        >
          <SlidersHorizontal className="size-4" />
          Category & Filter
        </button>

        {/* Sort Select (Mobile) */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="appearance-none border border-forest/15 bg-light py-2 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-forest focus:outline-none cursor-pointer rounded-xs"
          >
            <option value="most-sales">Sort by Most Sales</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
        </div>
      </div>

      {/* Mobile Bottom Pop Up Sheet Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          {/* Backdrop with Fade In */}
          <div
            className="fixed inset-0 bg-forest/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal with Slide Up Animation */}
          <div className="relative z-10 w-full max-h-[85vh] bg-light p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300 border-t border-forest/15">

            <div className="flex items-center justify-end">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-forest/60 hover:text-forest cursor-pointer"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-4">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {/* Left Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1">
          {renderSidebarContent()}
        </aside>

        {/* Right Main Content */}
        <div className="lg:col-span-3 xl:col-span-4">
          {/* Main Header & Sort Row */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 ${!hasActiveFilters ? "sm:mb-4" : "sm:mb-0"}`}>
            {/* Left: Active Category Header */}
            <div>
              <h1 className="text-2xl tracking-tight text-forest sm:text-3xl uppercase font-semibold">
                {activeCategoryName}
              </h1>
            </div>

            {/* Right: Sort Dropdown & Product Count Underneath */}
            <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest/50">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="appearance-none border border-forest/15 bg-light py-1.5 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-forest focus:border-forest/40 focus:outline-none cursor-pointer rounded-xs"
                  >
                    <option value="most-sales">Most Sales</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
                </div>
              </div>

              {/* Number of Products Text */}
              <p className="text-[10px] text-forest/50 uppercase font-medium">
                Showing <span className="font-semibold text-forest">{paginatedProducts.length}</span> of{" "}
                <span className="font-semibold text-forest">{filtered.length}</span> {filtered.length === 1 ? "product" : "products"}
              </p>
            </div>
          </div>

          {/* Active Filter Badges Showcase (Below Header/Sort Row) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Active Min Price Badge */}
              {minPrice !== "" && (
                <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest px-3 py-2 text-sm font-medium">
                  Min: ₱{Number(minPrice).toLocaleString("en-US")}
                  <button
                    onClick={clearMinPriceFilter}
                    className="cursor-pointer"
                    title="Remove Min Price Filter"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}

              {/* Active Max Price Badge */}
              {maxPrice !== "" && (
                <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest px-3 py-2 text-sm font-medium">
                  Max: ₱{Number(maxPrice).toLocaleString("en-US")}
                  <button
                    onClick={clearMaxPriceFilter}
                    className="cursor-pointer"
                    title="Remove Max Price Filter"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}

              {/* Active Search Badge */}
              {searchQuery.trim() !== "" && (
                <span className="inline-flex items-center gap-1.5 bg-forest/10 text-forest px-3 py-2 text-sm font-medium">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={clearSearchFilter}
                    className="cursor-pointer"
                    title="Remove Search Filter"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid Listing (Flat Grid without category separation) */}
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center py-40">
              <p className="text-sm text-forest/60 font-light leading-relaxed">
                You caught us. No products here. <br />
                Try clearing all filters or check back soon as we restock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Bar (Max 10 Products per page limit) */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page)
              window.scrollTo({ top: 200, behavior: "smooth" })
            }}
          />
        </div>
      </div>
    </div>
  )
}
