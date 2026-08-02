"use client"

import { useState } from "react"
import Link from "next/link"
import { useCartStore } from "@/stores/cart-store"
import { createOrder } from "./actions"
import type { PaymentMethod } from "@/types/database"
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

type FormData = {
  customerName: string
  email: string
  contactNumber: string
  address: string
  paymentMethod: PaymentMethod
  notes: string
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "e_wallet", label: "E-Wallet (GCash / Maya)" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore()
  const subtotal = getSubtotal()

  const [form, setForm] = useState<FormData>({
    customerName: "",
    email: "",
    contactNumber: "",
    address: "",
    paymentMethod: "cod",
    notes: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!form.customerName.trim()) newErrors.customerName = "Name is required."
    if (!form.email.trim()) newErrors.email = "Email is required."
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Please enter a valid email."
    if (!form.address.trim()) newErrors.address = "Delivery address is required."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    const result = await createOrder({
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      contactNumber: form.contactNumber.trim(),
      address: form.address.trim(),
      paymentMethod: form.paymentMethod,
      notes: form.notes.trim(),
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      })),
      totalAmount: subtotal,
    })

    setSubmitting(false)

    if (result.success && result.orderId) {
      setOrderId(result.orderId)
      clearCart()
    } else {
      setSubmitError(result.error || "Something went wrong.")
    }
  }

  // Success view
  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 lg:px-8 text-center">
        <CheckCircle className="mx-auto size-12 text-green-600 mb-6" />
        <h1 className="text-3xl font-light tracking-tight text-forest mb-3">
          Order Confirmed
        </h1>
        <p className="text-sm text-forest/50 mb-8">
          Thank you for your order. We will send a confirmation to your email.
        </p>

        <div className="bg-champagne p-8 text-left mb-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-forest mb-4">
            Order Details
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-forest/50">Order Number</dt>
              <dd className="font-mono text-forest">{orderId.slice(0, 8).toUpperCase()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-forest/50">Name</dt>
              <dd className="text-forest">{form.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-forest/50">Email</dt>
              <dd className="text-forest">{form.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-forest/50">Payment</dt>
              <dd className="text-forest">
                {paymentMethods.find((m) => m.value === form.paymentMethod)?.label}
              </dd>
            </div>
            <div className="flex justify-between border-t border-forest/15 pt-3">
              <dt className="font-semibold tracking-wide uppercase text-forest">Total</dt>
              <dd className="font-light text-forest">
                ₱{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </dd>
            </div>
          </dl>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-forest-ghost-white transition-colors hover:bg-forest-light"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  // Empty cart redirect
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 lg:px-8 text-center">
        <h1 className="text-3xl font-light tracking-tight text-forest mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-forest/50 mb-10">
          Add some items before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-forest-ghost-white transition-colors hover:bg-forest-light"
        >
          Browse Collection
        </Link>
      </div>
    )
  }

  // Checkout form
  return (
    <div className="w-full px-6 py-12 lg:px-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-forest/50 transition-colors hover:text-forest mb-10"
      >
        <ArrowLeft className="size-3.5" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-light tracking-tight text-forest mb-10">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Form fields */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-forest mb-4">
              Customer Information
            </h2>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-forest/50 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none"
                placeholder="Eleanor Vance"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-forest/50 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none"
                placeholder="eleanor@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-forest/50 mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => updateField("contactNumber", e.target.value)}
                className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none"
                placeholder="+639171234567"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-forest/50 mb-1.5">
                Delivery Address *
              </label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                rows={3}
                className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none resize-none"
                placeholder="Suite 402, One Bonifacio High Street, BGC, Taguig City"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-forest mb-3">
                Payment Method
              </label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 border p-4 cursor-pointer transition-colors ${
                      form.paymentMethod === method.value
                        ? "border-forest bg-champagne"
                        : "border-forest/15 hover:border-forest/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={(e) => updateField("paymentMethod", e.target.value)}
                      className="accent-forest"
                    />
                    <span className="text-sm text-forest/70">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-forest/50 mb-1.5">
                Order Notes (Optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
                className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/40 focus:border-forest/40 focus:outline-none resize-none"
                placeholder="Special delivery instructions..."
              />
            </div>
          </div>

          {/* Order summary sidebar */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="sticky top-36 bg-champagne p-8">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-forest mb-6">
                Order Summary
              </h2>

              <div className="divide-y divide-forest/15">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between py-3 text-sm">
                    <div>
                      <p className="text-forest">{item.product.name}</p>
                      <p className="text-forest/50">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-forest">
                      ₱{(item.product.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-forest/15 pt-6">
                <span className="text-sm font-semibold tracking-wide uppercase text-forest">
                  Total
                </span>
                <span className="text-lg font-light text-forest">
                  ₱{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {submitError && (
                <p className="mt-4 text-xs text-red-500">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 flex w-full items-center justify-center gap-2 bg-forest-ghost-white transition-colors hover:bg-forest-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

