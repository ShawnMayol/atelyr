"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import type { Product } from "@/types/database"
import AddToCartButton from "@/components/add-to-cart-button"

type ProductActionsProps = {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const maxQuantity = product.stock

  const decrease = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increase = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1)
  }

  if (product.stock <= 0 || product.status !== "active") {
    return <AddToCartButton product={product} />
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div>
        <p className="text-xs font-medium tracking-widest uppercase text-forest/50 mb-2">
          Quantity
        </p>
        <div className="inline-flex items-center border border-forest/15">
          <button
            onClick={decrease}
            disabled={quantity <= 1}
            className="flex size-11 items-center justify-center text-forest/70 transition-colors hover:bg-champagne disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="flex size-11 items-center justify-center text-sm font-medium text-forest border-x border-forest/15">
            {quantity}
          </span>
          <button
            onClick={increase}
            disabled={quantity >= maxQuantity}
            className="flex size-11 items-center justify-center text-forest/70 transition-colors hover:bg-champagne disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <AddToCartButton product={product} quantity={quantity} />
    </div>
  )
}
