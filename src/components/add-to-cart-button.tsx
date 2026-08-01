"use client"

import { useCartStore } from "@/stores/cart-store"
import type { Product } from "@/types/database"
import { ShoppingBag, Check } from "lucide-react"
import { useState } from "react"

type AddToCartButtonProps = {
  product: Product
  quantity?: number
  variant?: "default" | "minimal"
}

export default function AddToCartButton({
  product,
  quantity = 1,
  variant = "default",
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const isDisabled = product.stock <= 0 || product.status !== "active"

  const handleAdd = () => {
    if (isDisabled) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (isDisabled) {
    return (
      <button
        disabled
        className={`inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase opacity-50 cursor-not-allowed ${
          variant === "minimal"
            ? "text-forest/40"
            : "w-full bg-forest/10 text-forest/50 py-3.5 px-6"
        }`}
      >
        {product.stock <= 0 ? "Out of Stock" : "Unavailable"}
      </button>
    )
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleAdd}
        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-forest/60 transition-colors hover:text-forest"
      >
        {added ? (
          <>
            <Check className="size-3.5" />
            Added
          </>
        ) : (
          <>
            <ShoppingBag className="size-3.5" />
            Add to Cart
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className="inline-flex w-full items-center justify-center gap-2 bg-forest px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-colors hover:bg-forest-light"
    >
      {added ? (
        <>
          <Check className="size-4" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          Add to Cart
        </>
      )}
    </button>
  )
}
