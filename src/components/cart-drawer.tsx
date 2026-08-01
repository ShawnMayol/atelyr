"use client"


import Image from "next/image"
import Link from "next/link"
import { useCartStore } from "@/stores/cart-store"
import { getProductUrl } from "@/lib/utils"
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore()
  const subtotal = useCartStore((state) => state.getSubtotal())
  const totalItems = useCartStore((state) => state.getTotalItems())



  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Backdrop overlay with fade animation */}
      <div
        className={`fixed inset-0 bg-forest/50 backdrop-blur-xs transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Slide-over panel with smooth bezier slide animation */}
        <div
          className={`w-screen max-w-md bg-light shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-l border-forest/10 pointer-events-auto ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-forest/15 bg-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-forest" />
              <h2 className="text-base font-semibold tracking-wider uppercase text-forest">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-forest/60 hover:text-forest transition-colors rounded-sm hover:cursor-pointer"
              aria-label="Close cart"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Body: Item List or Empty State */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                <div className="size-16 rounded-full bg-forest/5 flex items-center justify-center text-forest/40">
                  <ShoppingBag className="size-8" />
                </div>
                <h3 className="text-lg font-light tracking-tight text-forest">
                  Your shopping bag is empty
                </h3>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 bg-forest px-6 py-3 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-colors hover:bg-forest-light hover:cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              <div className="divide-y divide-forest/15">
                {items.map((item, idx) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0 transition-all duration-300"
                    style={{
                      transitionDelay: isOpen ? `${idx * 50}ms` : '0ms'
                    }}
                  >
                    {/* Item Image */}
                    <Link
                      href={getProductUrl(item.product)}
                      onClick={closeCart}
                      className="aspect-[3/4] w-20 flex-shrink-0 overflow-hidden bg-champagne rounded-xs group"
                    >
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          width={150}
                          height={200}
                          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-forest/30">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link
                            href={getProductUrl(item.product)}
                            onClick={closeCart}
                            className="text-xs font-medium text-forest hover:underline line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-forest/30 hover:text-red-600 transition-colors p-1 ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-wider text-forest/50 mt-0.5">
                          {item.product.category?.name}
                        </p>
                        <p className="text-xs font-medium text-forest/80 mt-1">
                          ₱{item.product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Quantity Controls + Item Total */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-forest/15 rounded-xs">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex size-7 items-center justify-center text-forest/70 hover:bg-champagne transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="flex h-7 min-w-7 px-2 items-center justify-center text-xs font-semibold text-forest border-x border-forest/15">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex size-7 items-center justify-center text-forest/70 hover:bg-champagne transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <p className="text-xs font-semibold text-forest">
                          ₱{(item.product.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer: Subtotal + Checkout Button */}
          {items.length > 0 && (
            <div className="border-t border-forest/15 px-6 py-5 bg-light space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="uppercase tracking-widest text-xs text-forest/60">Subtotal</span>
                <span className="text-lg font-light text-forest">
                  ₱{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <p className="text-[11px] text-forest/50 text-center">
                Complimentary shipping & taxes calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center gap-2 bg-forest py-3.5 px-6 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-colors hover:bg-forest-light rounded-xs shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
