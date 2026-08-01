"use client"

import { useEffect } from "react"
import { useCartStore } from "@/stores/cart-store"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"

export default function CartPage() {
  const openCart = useCartStore((state) => state.openCart)

  useEffect(() => {
    openCart()
  }, [openCart])

  return (
    <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 text-center space-y-6">
      <div className="size-16 mx-auto rounded-full bg-forest/5 flex items-center justify-center text-forest/40">
        <ShoppingBag className="size-8" />
      </div>
      <h1 className="text-3xl font-light tracking-tight text-forest">
        Your Cart
      </h1>
      <p className="text-sm text-forest/60 max-w-md mx-auto leading-relaxed">
        Your shopping cart opens as a slide-over panel on the right side of the screen.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={openCart}
          className="inline-flex items-center gap-2 bg-forest px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-colors hover:bg-forest-light"
        >
          Open Sidebar Cart
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-forest/15 px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-forest transition-colors hover:bg-champagne"
        >
          Browse Collection
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
