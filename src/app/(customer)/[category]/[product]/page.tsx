import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Product, Category } from "@/types/database"
import ProductActions from "@/components/product-actions"
import ProductCard from "@/components/product-card"
import { extractIdFromSlug, getProductUrl } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { AccordionItem } from "@/components/ui/accordion"
import { Share2 } from "lucide-react"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; product: string }>
}) {
  const { category: categorySlug, product: productSlug } = await params
  const id = extractIdFromSlug(productSlug)
  const supabase = await createClient()

  // Fetch product with category
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name)")
    .eq("id", id)
    .single()

  if (!product) {
    notFound()
  }

  const typedProduct = product as Product & { category: Category }

  // Fetch related products (same category, exclude current)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, category:categories(id, name)")
    .eq("category_id", typedProduct.category_id)
    .eq("status", "active")
    .neq("id", id)
    .limit(4)

  const backCategoryUrl = `/${categorySlug}`

  return (
    <div className="w-full px-6 py-12 lg:px-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/" className="transition-colors hover:text-forest">
              Home
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Link href={backCategoryUrl} className="transition-colors hover:text-forest">
              {typedProduct.category?.name || "Collection"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{typedProduct.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Product detail */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="aspect-[3/4] w-full overflow-hidden bg-champagne rounded-xs">
          {typedProduct.image_url ? (
            <Image
              src={typedProduct.image_url}
              alt={typedProduct.name}
              width={800}
              height={1067}
              className="h-full w-full object-cover object-center"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-forest/30">
              No Image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-start space-y-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-forest mb-2">
              {typedProduct.name}
            </h1>

            <p className="text-xl font-normal text-forest/90 mb-5">
              ₱{typedProduct.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Stock Status Indicator */}
          <div className="text-xs font-medium text-forest/80 mb-4">
            {typedProduct.stock > 0 ? (
              <span>{typedProduct.stock} {typedProduct.stock === 1 ? "item" : "items"} left</span>
            ) : (
              <span className="text-forest/50">Out of stock</span>
            )}
          </div>

          {/* Add to Bag Action */}
          <div className="pt-2 pb-4">
            <ProductActions product={typedProduct} />
          </div>

          {/* Collapsibles */}
          <div className="border-t border-forest/15 pt-2">
            <AccordionItem title="DESCRIPTION AND SIZE GUIDE" defaultOpen={true}>
              <p className="text-xs text-forest/70 leading-relaxed">
                {typedProduct.description ||
                  "Crafted with meticulous attention to detail using premium materials. Designed for longevity and timeless elegance."}
              </p>
            </AccordionItem>

            <AccordionItem title="SHIPPING & DELIVERY">
              <p className="text-xs text-forest/70 leading-relaxed">
                Free standard shipping on all nationwide orders over ₱1,000. Orders are carefully packaged and dispatched within 1–2 business days. Express shipping options available at checkout.
              </p>
            </AccordionItem>
          </div>

          {/* Social Share Options */}
          <div className="flex items-center gap-8 pt-6 text-xs font-medium text-forest/70">
            <button
              type="button"
              className="inline-flex items-center gap-2 hover:text-forest transition-colors cursor-pointer"
            >
              <Share2 className="size-4 text-forest/60" />
              Share
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 hover:text-forest transition-colors cursor-pointer"
            >
              <svg className="size-4 text-forest/60 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Tweet
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 hover:text-forest transition-colors cursor-pointer"
            >
              <svg className="size-4 text-forest/60 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.377-.293 1.194-.333 1.361-.053.225-.173.271-.4.163-1.498-.697-2.435-2.888-2.435-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
              Pin it
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-forest/10 pt-16">
          <h2 className="text-xl font-light tracking-tight text-forest mb-10">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {(relatedProducts as (Product & { category: Category })[]).map(
              (related) => (
                <ProductCard key={related.id} product={related} />
              )
            )}
          </div>
        </section>
      )}
    </div>
  )
}
