"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { Product, Category } from "@/types/database"
import { ChevronDown, SlidersHorizontal, RotateCcw, X, Search } from "lucide-react"
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
  const [tempSearchQuery, setTempSearchQuery] = useState<string>(urlSearch)
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
    setTempSearchQuery(searchVal)
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

  // Apply Price & Search Filters Button click (updates ?min, ?max, ?search in URL)
  const handleApplyFilters = () => {
    updateUrlParams({
      min: tempMinPrice,
      max: tempMaxPrice,
      search: tempSearchQuery,
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
    setTempSearchQuery("")
    updateUrlParams({ search: null })
  }

  // Clear all filters resets query parameters while preserving the current category route
  const handleResetAllFilters = () => {
    setMinPrice("")
    setMaxPrice("")
    setTempMinPrice("")
    setTempMaxPrice("")
    setSearchQuery("")
    setTempSearchQuery("")
    setSortOrder("most-sales")
    setMobileFilterOpen(false)
    router.push(pathname)
  }

  // Client-side filtering logic
  const filtered = useMemo(() => {
    let result = [...products]

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      const slugTarget = slugify(selectedCategory)
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
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
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
      {/* Search Input Filter */}
      <div className="space-y-2 pb-1">
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-forest/50">
          Search
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-forest/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApplyFilters()
                setMobileFilterOpen(false)
              }
            }}
            className="w-full border border-forest/15 bg-light py-2 pl-8 pr-8 text-xs text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none rounded-xs"
          />
          {tempSearchQuery && (
            <button
              onClick={clearSearchFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest p-1 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

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

        {/* Apply Filter Button */}
        <button
          onClick={() => {
            handleApplyFilters()
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
      {/* Mobile Filter Toggle & Sort Bar */}
      <div className="lg:hidden flex items-center justify-between gap-4 pb-2">
        {/* Category & Filter Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-2.5 py-2 px-1 sm:px-2 text-sm font-semibold uppercase tracking-wider text-forest transition-colors shrink-0 cursor-pointer hover:text-forest/80"
          title="Category & Filter"
          aria-label="Category & Filter"
        >
          <SlidersHorizontal className="size-5 shrink-0" />
          <span className="hidden sm:inline">Category & Filter</span>
        </button>

        {/* Sort Select (Mobile) */}
        <div className="relative flex-1 max-w-[200px] sm:max-w-none">
          <div className="relative flex items-center justify-center">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort products"
              className="w-full appearance-none bg-transparent py-2 pl-9 pr-6 text-sm font-semibold uppercase tracking-wider text-forest focus:outline-none cursor-pointer truncate text-center"
            >
              <option value="most-sales">Most Sales</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 size-4 text-forest/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Pop Up Sheet Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop with Fade In */}
          <div
            className="fixed inset-0 bg-forest/60 backdrop-blur-xs animate-in fade-in duration-300"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal */}
          <div className="fixed inset-x-0 bottom-0 z-10 max-h-[85vh] bg-light p-6 pb-8 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-300 border-t border-forest/15 rounded-t-sm">
            <div className="flex items-center justify-between border-b border-forest/15 pb-3">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-forest">
                Category & Filters
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-forest/60 hover:text-forest cursor-pointer"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-2">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout: Desktop Sidebar (Left) + Products Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          {renderSidebarContent()}
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar: Category Name & Active Filter Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl tracking-tight text-forest sm:text-3xl uppercase font-semibold">
                {activeCategoryName}
              </h1>
            </div>

            {/* Sort Select (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest/50">
                Sort:
              </span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none border border-forest/15 bg-light py-1.5 pl-3 pr-8 text-xs font-semibold uppercase tracking-wider text-forest focus:outline-none cursor-pointer rounded-xs"
                >
                  <option value="most-sales">Sort by Most Sales</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-forest/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Query Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-gray-200 px-3 py-2 text-xs text-forest font-medium rounded-xs">
                  "{searchQuery}"
                  <button
                    onClick={clearSearchFilter}
                    className="cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {minPrice && (
                <span className="inline-flex items-center gap-1.5 bg-gray-200 px-3 py-2 text-xs text-forest font-medium rounded-xs">
                  Min Price: ₱{minPrice}
                  <button
                    onClick={clearMinPriceFilter}
                    className="cursor-pointer"
                    aria-label="Remove min price filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}

              {maxPrice && (
                <span className="inline-flex items-center gap-1.5 bg-gray-200 px-3 py-2 text-xs text-forest font-medium rounded-xs">
                  Max Price: ₱{maxPrice}
                  <button
                    onClick={clearMaxPriceFilter}
                    className="cursor-pointer"
                    aria-label="Remove max price filter"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid Items */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center ">
              <p className="text-forest/60 text-sm font-medium">
                No products here. <br />
                Try clearing all filters or check back soon as we restock.
              </p>
              <button
                onClick={handleResetAllFilters}
                className="mt-4 inline-flex items-center gap-2 bg-forest px-5 py-2 text-xs font-semibold tracking-widest uppercase text-ghost-white hover:bg-forest-light transition-colors cursor-pointer rounded-xs"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Bar */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-forest/15">
              <p className="text-xs text-forest/60">
                Showing{" "}
                <span className="font-semibold text-forest">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-forest">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of <span className="font-semibold text-forest">{filtered.length}</span> products
              </p>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="pt-0 justify-end"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
