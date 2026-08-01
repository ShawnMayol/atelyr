"use client"

import Link from "next/link"
import { ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/stores/cart-store"

const categories = [
  { name: "High-End Apparel", href: "/products?category=high-end-apparel" },
  { name: "Luxury Footwear", href: "/products?category=luxury-footwear" },
  { name: "Fine Leather Goods", href: "/products?category=fine-leather-goods" },
  { name: "Accessories", href: "/products?category=accessories" },
  { name: "Fragrances & Jewelry", href: "/products?category=fragrances-jewelry" },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartItemCount = useCartStore((state) => state.getTotalItems())

  return (
    <header className="sticky top-0 z-50 w-full border-b border-forest/10 bg-champagne-light/80 backdrop-blur-md">
      {/* Top announcement bar */}
      <div className="bg-forest text-ghost-white text-center text-xs tracking-widest uppercase py-3 px-4">
        Complimentary shipping on all orders over ₱500
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <button
          type="button"
          className="lg:hidden -m-2.5 p-2.5 text-forest"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold tracking-[0.3em] uppercase text-forest">
            Atelyr
          </span>
        </Link>

        {/* Desktop navigation links */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="text-xs font-medium tracking-widest uppercase text-forest/70 transition-colors hover:text-forest"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Right actions: search + cart */}
        <div className="flex items-center gap-x-4">
          <Link
            href="/products"
            className="text-forest/70 transition-colors hover:text-forest"
            aria-label="Search products"
          >
            <Search className="size-5" />
          </Link>

          <Link
            href="/cart"
            className="relative text-forest/70 transition-colors hover:text-forest"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="size-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-forest text-[10px] font-medium text-ghost-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-forest/10 bg-champagne-light">
          <div className="flex flex-col space-y-1 px-6 py-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block py-3 text-sm font-medium tracking-wide uppercase text-forest/70 transition-colors hover:text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
