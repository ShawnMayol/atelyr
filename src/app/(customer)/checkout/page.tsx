"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { createOrder } from "./actions";
import type { PaymentMethod } from "@/types/database";
import {
  CheckCircle,
  Loader2,
  Building2,
  Banknote,
  Smartphone,
  ChevronDown,
} from "lucide-react";

type CountryOption = {
  code: string;
  name: string;
  dial: string;
  flag: string;
};

const countries: CountryOption[] = [
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
];

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  e_wallet: "E-Wallet",
  bank_transfer: "Bank Transfer",
};

type FormData = {
  customerName: string;
  email: string;
  contactNumber: string;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string;
};

type PurchasedSummary = {
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      image_url: string | null;
    };
    quantity: number;
  }[];
  subtotal: number;
  shippingCost: number;
  shippingFee: number;
  totalPayment: number;
  isFreeShipping: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart, getTotalItems } = useCartStore();
  const subtotal = getSubtotal();
  const totalItemsCount = getTotalItems();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [purchasedSummary, setPurchasedSummary] = useState<PurchasedSummary | null>(null);

  // Redirect to /all if cart is empty and no order has been completed
  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.replace("/all");
    }
  }, [items.length, orderId, router]);

  // Shipping Calculation: Free for subtotal >= 1000, otherwise 500
  const isFreeShipping = subtotal >= 1000;
  const shippingCost = 500;
  const shippingFee = isFreeShipping ? 0 : shippingCost;
  const totalPayment = subtotal + shippingFee;

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    countries[0],
  ); // Default PH (+63)
  const [phoneDigits, setPhoneDigits] = useState("");
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);

  const [form, setForm] = useState<FormData>({
    customerName: "",
    email: "",
    contactNumber: "",
    address: "",
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.customerName.trim()) {
      newErrors.customerName = "Full Name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const digitsOnly = phoneDigits.replace(/\D/g, "");
    if (!phoneDigits.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (digitsOnly.length < 10) {
      newErrors.contactNumber = "Please enter a valid phone number.";
    }

    if (!form.address.trim()) {
      newErrors.address = "Delivery address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const section1Ref = useRef<HTMLElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      section1Ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

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
      totalAmount: totalPayment,
    });

    setSubmitting(false);

    if (result.success && result.orderId) {
      setPurchasedSummary({
        items: items.map((i) => ({
          product: {
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            image_url: i.product.image_url,
          },
          quantity: i.quantity,
        })),
        subtotal,
        shippingCost,
        shippingFee,
        totalPayment,
        isFreeShipping,
      });
      setOrderId(result.orderId);
      clearCart();
    } else {
      setSubmitError(
        result.error || "Something went wrong processing your order.",
      );
    }
  };

  // Success view
  if (orderId && purchasedSummary) {
    const paymentLabel =
      paymentMethodLabels[form.paymentMethod] || form.paymentMethod;

    return (
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <CheckCircle className="mx-auto size-12 text-green-700" />
          <h1 className="text-3xl font-light tracking-tight text-forest">
            Order Confirmed
          </h1>
          <p className="text-xs text-forest/60 max-w-md mx-auto leading-relaxed">
            We have received your order. Shipping details will be sent to your
            email. Thank you for shopping with ATELYR.
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-light border border-forest/15 py-4 sm:py-6 rounded-xs shadow-xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-8 pb-4 border-b border-forest/15">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-bold tracking-widest uppercase text-forest">
                Order Summary
              </p>
              <p className="text-sm font-mono text-forest/50 mt-0.5">
                Ref: {orderId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer, Address & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-8 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wider text-forest/80 mb-1">
                Customer
              </p>
              <p className="text-forest/70 mt-2">{form.customerName}</p>
              <p className="text-forest/70 mt-2">{form.email}</p>
              <p className="text-forest/70 mt-2">{form.contactNumber}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-forest/80 mb-1">
                Delivery Address
              </p>
              <p className="text-forest/70 leading-relaxed mt-2">{form.address}</p>

              <div className="mt-4 pt-3">
                <p className="font-semibold uppercase tracking-wider text-forest/80 mb-1">
                  Payment Method
                </p>
                <p className="text-forest/70">{paymentLabel}</p>
              </div>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="px-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest/50 mb-3">
              Purchased Items
            </p>
            <div className="divide-y divide-forest/10">
              {purchasedSummary.items.map((item) => (
                <div
                  key={item.product.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold uppercase text-forest">
                      {item.product.name}
                    </p>
                    <p className="text-forest/60 mt-0.5">
                      Qty: {item.quantity} × ₱
                      {item.product.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <p className="font-bold text-forest">
                    ₱
                    {(item.product.price * item.quantity).toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Dashed Financial Summary */}
          <div className="pt-4 border-t-2 border-dashed border-forest/25">
            <div className="flex justify-end px-4 sm:px-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
                  Subtotal
                </span>
                <span className="text-xs font-semibold text-forest">
                  ₱
                  {purchasedSummary.subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
                  Shipping
                </span>
                <span className="text-xs font-semibold text-forest">
                  ₱
                  {purchasedSummary.shippingCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                {purchasedSummary.isFreeShipping && (
                  <>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                      Free Shipping
                    </span>
                    <span className="text-xs font-bold text-green-700">
                      -₱
                      {purchasedSummary.shippingCost.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </>
                )}

                <span className="text-sm font-bold uppercase tracking-wider text-forest">
                  Total Payment
                </span>
                <span className="text-base font-bold text-forest">
                  ₱
                  {purchasedSummary.totalPayment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end">
          <Link
            href="/all"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-forest/70 hover:text-forest hover:underline underline-offset-4 transition-colors py-2"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart redirect (returns null while useEffect navigates to /all)
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12 space-y-4">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-forest">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Customer Information */}
        <section
          ref={section1Ref}
          className="bg-light border border-forest/15 py-4 sm:py-6 space-y-4 rounded-xs shadow-xs"
        >
          <div className="flex items-center gap-3 px-6 sm:px-8 pb-4 border-b border-forest/15">
            <span className="flex size-7 items-center justify-center rounded-full bg-forest text-ghost-white text-xs font-bold">
              1
            </span>
            <h2 className="text-sm font-bold tracking-widest uppercase text-forest">
              Customer Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 sm:px-8">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-forest/70 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => updateField("customerName", e.target.value)}
                className={`w-full border bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/30 focus:outline-none rounded-xs ${
                  errors.customerName
                    ? "border-red-500 focus:border-red-600"
                    : "border-forest/15 focus:border-forest"
                }`}
                placeholder="e.g. Maria Santos"
              />
              {errors.customerName && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.customerName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold tracking-wide uppercase text-forest/70 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full border bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/30 focus:outline-none rounded-xs ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-forest/15 focus:border-forest"
                }`}
                placeholder="maria@mail.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Contact Number with Country Selector Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold tracking-wide uppercase text-forest/70 mb-2">
                Contact Number *
              </label>
              <div
                className={`relative flex items-center border bg-light rounded-xs transition-colors ${
                  errors.contactNumber
                    ? "border-red-500 focus-within:border-red-600"
                    : "border-forest/15 focus-within:border-forest"
                }`}
              >
                {/* Country Flag & Dial Selector Button */}
                <button
                  type="button"
                  onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-3 border-r border-forest/15 text-xs font-medium text-forest transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Select country code"
                >
                  <span className="text-base leading-none">
                    {selectedCountry.flag}
                  </span>
                  <span className="font-semibold">{selectedCountry.dial}</span>
                  <ChevronDown
                    className={`size-3.5 text-forest/60 transition-transform ${phoneDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Phone Digits Input (Max 10 digits) */}
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneDigits}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setPhoneDigits(digits);
                    const fullNumber = digits
                      ? `${selectedCountry.dial} ${digits}`
                      : "";
                    updateField("contactNumber", fullNumber);
                  }}
                  className="w-full bg-transparent py-3 px-3 text-sm text-forest placeholder:text-forest/30 focus:outline-none"
                  placeholder="917 123 4567"
                />
              </div>

              {/* Country Selector Floating Dropdown */}
              {phoneDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setPhoneDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 z-50 w-72 max-h-60 overflow-y-auto bg-light border border-forest/15 shadow-2xl rounded-xs py-1 divide-y divide-forest/10 animate-in fade-in duration-150">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setPhoneDropdownOpen(false);
                          const fullNumber = phoneDigits
                            ? `${country.dial} ${phoneDigits}`
                            : "";
                          updateField("contactNumber", fullNumber);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                          selectedCountry.code === country.code
                            ? "font-semibold text-forest bg-champagne/60"
                            : "text-forest/80 hover:bg-champagne/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">
                            {country.flag}
                          </span>
                          <span className="truncate">{country.name}</span>
                        </div>
                        <span className="font-mono text-forest/60 text-[11px] ml-2">
                          {country.dial}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {errors.contactNumber && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold tracking-wide uppercase text-forest/70 mb-2">
                Delivery Address *
              </label>
              <textarea
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                rows={3}
                className={`w-full border bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/30 focus:outline-none resize-none rounded-xs ${
                  errors.address
                    ? "border-red-500 focus:border-red-600"
                    : "border-forest/15 focus:border-forest"
                }`}
                placeholder="House / Unit No., Street, Barangay, City, Province, Postal Code"
              />
              {errors.address && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.address}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Order Summary (Table Format) */}
        <section className="bg-light border border-forest/15 py-4 sm:py-6 space-y-6 rounded-xs shadow-xs">
          <div className="flex items-center gap-3 px-6 sm:px-8 pb-4 border-b border-forest/15">
            <span className="flex size-7 items-center justify-center rounded-full bg-forest text-ghost-white text-xs font-bold">
              2
            </span>
            <h2 className="text-sm font-bold tracking-widest uppercase text-forest">
              Order Summary
            </h2>
          </div>

          {/* Product Items Table */}
          <div className="overflow-x-auto px-6 sm:px-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest/15 text-[11px] font-bold tracking-widest uppercase text-forest/50">
                  <th scope="col" className="py-3 px-2 w-16"></th>
                  <th scope="col" className="py-3 px-3"></th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Unit Price
                  </th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Quantity
                  </th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Item Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {items.map((item) => (
                  <tr key={item.product.id} className="text-xs text-forest">
                    {/* Image Column */}
                    <td className="py-3.5 px-2">
                      <div className="aspect-[3/4] w-14 flex-shrink-0 overflow-hidden bg-champagne rounded-xs border border-forest/10 relative">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            width={100}
                            height={133}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-forest/30">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Product Name Column */}
                    <td className="py-3.5 px-3 font-semibold uppercase tracking-wider text-forest align-middle">
                      {item.product.name}
                    </td>

                    {/* Unit Price Column */}
                    <td className="py-3.5 px-3 text-right text-forest/80 align-middle">
                      ₱
                      {item.product.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Quantity Column */}
                    <td className="py-3.5 px-3 text-right font-semibold text-forest align-middle">
                      {item.quantity}
                    </td>

                    {/* Item Subtotal Column */}
                    <td className="py-3.5 px-3 text-right font-bold text-forest align-middle">
                      ₱
                      {(item.product.price * item.quantity).toLocaleString(
                        "en-US",
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shipping Summary (Right-aligned 2-Column layout) */}
          <div className="pt-6 border-t-2 border-dashed border-forest/25 px-6 sm:px-8">
            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-right">
                {/* Shipping Fee Row */}
                <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
                  Shipping Fee
                </span>
                <span className="text-xs font-semibold text-forest">
                  ₱
                  {shippingCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                {/* Order Total Row */}
                <span className="text-sm font-bold uppercase tracking-wider text-forest">
                  Order Total ({totalItemsCount}{" "}
                  {totalItemsCount === 1 ? "item" : "items"})
                </span>
                <span className="text-base font-bold text-forest">
                  ₱
                  {(subtotal + shippingCost).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Payment Method & Place Order */}
        <section className="bg-light border border-forest/15 py-4 sm:py-6 space-y-6 rounded-xs shadow-xs">
          <div className="flex items-center gap-3 px-4 sm:px-6 pb-4 border-b border-forest/15">
            <span className="flex size-7 items-center justify-center rounded-full bg-forest text-ghost-white text-xs font-bold">
              3
            </span>
            <h2 className="text-sm font-bold tracking-widest uppercase text-forest">
              Payment Method
            </h2>
          </div>

          {/* Payment Method Selector with Icons */}
          <div>
            <label className="block text-xs font-semibold px-4 sm:px-6 tracking-wider uppercase text-forest mb-3">
              Select Payment Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-6">
              {/* GCash / Maya E-Wallet */}
              <label
                className={`flex flex-col justify-between p-4 border cursor-pointer transition-all rounded-xs ${
                  form.paymentMethod === "e_wallet"
                    ? "border-forest bg-champagne shadow-xs"
                    : "border-forest/15 hover:border-forest/40 bg-light"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-5 text-forest" />
                    <span className="text-xs font-bold uppercase tracking-wider text-forest">
                      E-Wallet
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="e_wallet"
                    checked={form.paymentMethod === "e_wallet"}
                    onChange={(e) =>
                      updateField("paymentMethod", e.target.value)
                    }
                    className="accent-forest"
                  />
                </div>
              </label>

              {/* Bank Transfer */}
              <label
                className={`flex flex-col justify-between p-4 border cursor-pointer transition-all rounded-xs ${
                  form.paymentMethod === "bank_transfer"
                    ? "border-forest bg-champagne shadow-xs"
                    : "border-forest/15 hover:border-forest/40 bg-light"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-forest" />
                    <span className="text-xs font-bold uppercase tracking-wider text-forest">
                      Bank Transfer
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={form.paymentMethod === "bank_transfer"}
                    onChange={(e) =>
                      updateField("paymentMethod", e.target.value)
                    }
                    className="accent-forest"
                  />
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex flex-col justify-between p-4 border cursor-pointer transition-all rounded-xs ${
                  form.paymentMethod === "cod"
                    ? "border-forest bg-champagne shadow-xs"
                    : "border-forest/15 hover:border-forest/40 bg-light"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-5 text-forest" />
                    <span className="text-xs font-bold uppercase tracking-wider text-forest">
                      Cash on Delivery
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={(e) =>
                      updateField("paymentMethod", e.target.value)
                    }
                    className="accent-forest"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className="px-4 sm:px-6">
            <label className="block text-xs font-semibold tracking-wide uppercase text-forest/70 mb-2">
              Order Notes (Optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={2}
              className="w-full border border-forest/15 bg-light py-3 px-4 text-sm text-forest placeholder:text-forest/30 focus:border-forest focus:outline-none resize-none rounded-xs"
              placeholder="Add any special instructions or requests for your delivery..."
            />
          </div>

          {/* Final Financial Breakdown Summary (Right-aligned 2-Column layout) */}
          <div className="pt-6 border-t-2 border-dashed border-forest/25 px-4 sm:px-6">
            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-right">
                {/* Item Subtotal */}
                <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
                  Item Subtotal
                </span>
                <span className="text-xs font-semibold text-forest">
                  ₱
                  {subtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                {/* Shipping Subtotal */}
                <span className="text-xs font-semibold text-forest/70 uppercase tracking-wider">
                  Shipping Subtotal
                </span>
                <span className="text-xs font-semibold text-forest">
                  ₱
                  {shippingCost.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>

                {/* Free Shipping Discount (-₱500 Free Shipping if subtotal >= 1000) */}
                {isFreeShipping && (
                  <>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                      Free Shipping Discount
                    </span>
                    <span className="text-xs font-bold text-green-700">
                      -₱
                      {shippingCost.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </>
                )}

                {/* Total Payment */}
                <span className="text-sm font-bold uppercase tracking-wider text-forest">
                  Total Payment
                </span>
                <span className="text-base font-bold text-forest">
                  ₱
                  {totalPayment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="mx-4 sm:mx-6 p-4 border border-red-200 bg-red-50 text-xs text-red-600 rounded-xs">
              {submitError}
            </div>
          )}

          {/* Place Order Button */}
          <div className="px-4 sm:px-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 bg-forest py-4 px-8 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-colors hover:bg-forest-light hover:cursor-pointer disabled:opacity-50 cursor-pointer rounded-xs shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
