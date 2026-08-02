"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, Search, Menu, X, ChevronDown, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/stores/cart-store";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

import { slugify } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // Fetch dynamic categories from Supabase and handle client hydration
  useEffect(() => {
    setMounted(true);
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (data) {
        setCategories(data as Category[]);
      }
    }
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    const targetPath = pathname === "/" ? "/all" : pathname;
    const queryString = params.toString();
    router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full  bg-light backdrop-blur-md relative"
      onMouseLeave={() => setCategoryHovered(false)}
    >
      {/* Top Promotional banner */}
      <div className="bg-forest text-ghost-white text-center text-xs tracking-widest uppercase py-2.5 px-4">
        Free shipping on all orders over ₱1000
      </div>

      {/* Main Navbar Bar */}
      <nav className="relative mx-auto flex h-16 w-full items-center justify-between px-6 lg:px-12">
        {/* Left Section: Dynamic Categories Trigger */}
        <div className="flex items-center gap-x-6">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-forest cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
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
            <Image
              src="/brand.png"
              alt="ATELYR"
              width={160}
              height={40}
              priority
              className="h-7 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-x-4">
          {/* Expandable Search Bar */}
          {!mobileMenuOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center justify-end relative"
            >
              <div
                className={`flex items-center flex-row-reverse transition-all duration-300 ease-in-out overflow-hidden border-b ${
                  isSearchOpen || searchQuery
                    ? "w-44 lg:w-56 border-forest/30 focus-within:border-forest"
                    : "w-9 border-transparent"
                }`}
              >
                {/* Search Icon Button (On Right) */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSearchOpen && searchQuery.trim()) {
                      const form = searchInputRef.current?.form;
                      if (form) form.requestSubmit();
                    } else {
                      setIsSearchOpen(!isSearchOpen);
                    }
                  }}
                  className="p-1 text-forest/80 hover:text-forest transition-colors cursor-pointer flex-shrink-0"
                  aria-label="Toggle search"
                >
                  <Search className="size-5" />
                </button>

                {/* Search Input Field */}
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) {
                      setIsSearchOpen(false);
                    }
                  }}
                  className={`bg-transparent py-1.5 pl-2 text-xs text-forest placeholder:text-forest/40 focus:outline-none transition-all duration-300 ${
                    isSearchOpen || searchQuery
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 pointer-events-none p-0"
                  }`}
                />
              </div>
            </form>
          )}

          {/* Profile / Account Icon (Desktop Only) */}
          <Link
            href="/admin/products"
            className="hidden lg:flex p-1 text-forest/80 hover:text-forest transition-colors cursor-pointer"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>

          {/* Shopping Bag Cart Icon Button */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-1 text-forest/80 hover:text-forest transition-colors cursor-pointer"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="size-5" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-forest text-[10px] font-medium text-ghost-white shadow-xs">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Floating Categories Overlay (Desktop Hover) */}
      <div
        className={`absolute top-full left-0 right-0 w-full bg-light border-b border-forest/10 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          categoryHovered
            ? "max-h-24 opacity-100 py-4 pointer-events-auto"
            : "max-h-0 opacity-0 py-0 border-b-0 pointer-events-none"
        }`}
        onMouseEnter={() => setCategoryHovered(true)}
        onMouseLeave={() => setCategoryHovered(false)}
      >
        <div className="mx-auto w-full px-6 lg:px-12">
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
        <div className="absolute top-full left-0 right-0 z-50 w-full border-b border-forest/15 bg-light px-6 py-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 lg:hidden">
          {/* Mobile Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center"
          >
            <div className="flex items-center flex-row-reverse w-full border-b border-forest/30 focus-within:border-forest pb-1">
              <button
                type="submit"
                className="p-1 text-forest/80 hover:text-forest transition-colors cursor-pointer flex-shrink-0"
                aria-label="Submit search"
              >
                <Search className="size-5" />
              </button>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-1.5 pl-2 text-xs text-forest placeholder:text-forest/40 focus:outline-none"
              />
            </div>
          </form>

          {/* Mobile Dynamic Categories List */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest/40 px-1 mb-2">
              Categories
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${slugify(cat.name)}`}
                className="block py-2 text-xs font-semibold tracking-wider uppercase text-forest/80 hover:text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Profile / Account Link inside Mobile Menu */}
          <div className="pt-3 border-t border-forest/10">
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 py-2 text-xs font-semibold tracking-wider uppercase text-forest/80 hover:text-forest"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="size-4 text-forest/60" />
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
