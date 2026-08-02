"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product, Category } from "@/types/database"
import { getProductUrl } from "@/lib/utils"
import { Heart, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"

type ProductCardProps = {
  product: Product & { category?: Category | { name: string } }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    openCart()
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="group flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-champagne rounded-xs">
          <Link href={getProductUrl(product)} className="block size-full">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={600}
                height={800}
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-forest/30 text-xs uppercase tracking-wider font-semibold">
                No Image
              </div>
            )}
          </Link>

          {/* Upper Right Corner Heart Icon */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2.5 right-2.5 z-10 size-8 rounded-full bg-white/80 backdrop-blur-xs text-forest/70 hover:text-red-600 hover:bg-white flex items-center justify-center transition-all shadow-xs cursor-pointer"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`size-4 transition-colors ${
                isWishlisted ? "fill-red-600 text-red-600" : ""
              }`}
            />
          </button>
        </div>

        {/* Product Details + Clean Cart Button on the Right */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Link href={getProductUrl(product)} className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-forest uppercase tracking-wider line-clamp-1 group-hover:underline underline-offset-4">
              {product.name}
            </h3>
            <p className="text-xs font-medium text-forest/70 mt-0.5">
              ₱{Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </Link>

          {/* Clean Cart Button */}
          <button
            onClick={handleAddToCart}
            className="size-8 rounded-full bg-forest text-ghost-white flex items-center justify-center transition-transform hover:scale-105 hover:bg-forest-light cursor-pointer flex-shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
