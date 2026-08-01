import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getProductUrl(product: {
  id: string
  name: string
  category?: { name: string }
}): string {
  const catSlug = product.category?.name ? slugify(product.category.name) : "collection"
  const nameSlug = slugify(product.name)
  return `/${catSlug}/${nameSlug}-${product.id}`
}

export function extractIdFromSlug(slug: string): string {
  const match = slug.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i)
  if (match) return match[1]
  const parts = slug.split(/[+-]/)
  return parts[parts.length - 1]
}
