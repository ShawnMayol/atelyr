"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Search, Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/types/database"

import { slugify } from "@/lib/utils"

export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryHovered, setCategoryHovered] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const cartItemCount = useCartStore((state) => state.getTotalItems())
  const openCart = useCartStore((state) => state.openCart)

  // Fetch dynamic categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase.from("categories").select("*").order("name")
      if (data) {
        setCategories(data as Category[])
      }
    }
    fetchCategories()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetCat = categories.length > 0 ? slugify(categories[0].name) : ""
    if (targetCat) {
      router.push(`/${targetCat}`)
    }
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-forest/10 bg-light backdrop-blur-md relative"
      onMouseLeave={() => setCategoryHovered(false)}
    >
      {/* Top announcement bar */}
      <div className="bg-forest text-ghost-white text-center text-xs tracking-widest uppercase py-2.5 px-4">
        Complimentary shipping on all orders over ₱500
      </div>

      {/* Main Navbar Bar */}
      <nav className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Left Section: Dynamic Categories Trigger */}
        <div className="flex items-center gap-x-6">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-forest"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {/* Categories Hover Trigger (Desktop) */}
          <div
            className="hidden lg:flex items-center"
            onMouseEnter={() => setCategoryHovered(true)}
          >
            <button
              onClick={() => setCategoryHovered(!categoryHovered)}
              className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-forest/80 hover:text-forest transition-colors py-5 cursor-pointer"
            >
              Categories
              <ChevronDown
                className={`size-3.5 transition-transform duration-300 ${
                  categoryHovered ? "rotate-180 text-forest" : "text-forest/60"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Center Section: ATELYR Brand Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold tracking-[0.35em] uppercase text-forest">
              ATELYR
            </span>
          </Link>
        </div>

        {/* Right Section: Static Search Bar + Cart Shopping Bag Icon */}
        <div className="flex items-center gap-x-4">
          {/* Static Search Bar (Desktop - Right Side) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:relative md:flex items-center">
            <Search className="absolute left-3 size-3.5 text-forest/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 lg:w-56 rounded-full border border-forest/15 bg-light/60 py-1.5 pl-8 pr-3 text-xs text-forest placeholder:text-forest/40 focus:border-forest/40 focus:bg-light focus:outline-none transition-all"
            />
          </form>

          {/* Cart Icon Button */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-1 text-forest/80 hover:text-forest transition-colors hover:cursor-pointer"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="size-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-forest text-[10px] font-medium text-ghost-white shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Floating Categories Overlay (Spans from Categories start to Cart end) */}
      <div
        className={`absolute top-full left-0 right-0 w-full bg-light border-b border-forest/10 shadow-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          categoryHovered
            ? "max-h-24 opacity-100 py-4 pointer-events-auto"
            : "max-h-0 opacity-0 py-0 border-b-0 pointer-events-none"
        }`}
        onMouseEnter={() => setCategoryHovered(true)}
        onMouseLeave={() => setCategoryHovered(false)}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between w-full flex-wrap gap-y-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${slugify(cat.name)}`}
                onClick={() => setCategoryHovered(false)}
                className="text-xs font-medium tracking-widest uppercase text-forest/75 hover:text-forest transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-forest/10 bg-light px-6 py-4 space-y-4 animate-in fade-in duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 size-4 text-forest/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-forest/15 bg-light py-2 pl-9 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none"
            />
          </form>

          {/* Mobile Dynamic Categories List */}
          <div className="space-y-1 pt-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 px-1 mb-2">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${slugify(cat.name)}`}
                className="block py-2 text-xs font-medium tracking-wide uppercase text-forest/70 hover:text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
