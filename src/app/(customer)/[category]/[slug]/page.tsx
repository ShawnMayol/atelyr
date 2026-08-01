import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Product, Category } from "@/types/database"
import { ArrowLeft } from "lucide-react"
import ProductActions from "@/components/product-actions"
import { extractIdFromSlug, getProductUrl } from "@/lib/utils"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category: categorySlug, slug } = await params
  const id = extractIdFromSlug(slug)
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
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      {/* Back link */}
      <Link
        href={backCategoryUrl}
        className="inline-flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-forest/50 transition-colors hover:text-forest mb-10"
      >
        <ArrowLeft className="size-3.5" />
        Back to {typedProduct.category?.name || "Collection"}
      </Link>

      {/* Product detail */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="aspect-[3/4] w-full overflow-hidden bg-champagne">
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
        <div className="flex flex-col justify-center">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-forest/50 mb-4">
            {typedProduct.category?.name}
          </p>

          <h1 className="text-3xl font-light tracking-tight text-forest mb-4">
            {typedProduct.name}
          </h1>

          <p className="text-2xl font-light text-forest mb-6">
            ₱{typedProduct.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>

          {/* Stock status */}
          <div className="mb-6">
            {typedProduct.stock > 10 && (
              <span className="text-xs font-medium tracking-wide uppercase text-green-700">
                In Stock
              </span>
            )}
            {typedProduct.stock > 0 && typedProduct.stock <= 10 && (
              <span className="text-xs font-medium tracking-wide uppercase text-amber-600">
                Only {typedProduct.stock} left
              </span>
            )}
            {typedProduct.stock <= 0 && (
              <span className="text-xs font-medium tracking-wide uppercase text-red-500">
                Out of Stock
              </span>
            )}
          </div>

          {typedProduct.description && (
            <p className="text-sm leading-relaxed text-forest/60 mb-8">
              {typedProduct.description}
            </p>
          )}

          {/* Quantity selector + Add to Cart */}
          <ProductActions product={typedProduct} />

          {/* Extra info */}
          <div className="mt-10 space-y-4 border-t border-forest/10 pt-8">
            <p className="text-xs text-forest/50">
              Complimentary shipping on orders over ₱500
            </p>
            <p className="text-xs text-forest/50">
              Free returns within 30 days
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-forest/10 pt-16">
          <h2 className="text-xl font-light tracking-tight text-forest mb-10">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {(relatedProducts as (Product & { category: Category })[]).map(
              (related) => (
                <div key={related.id} className="group">
                  <Link href={getProductUrl(related)}>
                    <div className="aspect-[3/4] w-full overflow-hidden bg-champagne">
                      {related.image_url ? (
                        <Image
                          src={related.image_url}
                          alt={related.name}
                          width={400}
                          height={533}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-forest/30">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-forest/50">
                      {related.category?.name}
                    </p>
                    <Link href={getProductUrl(related)}>
                      <h3 className="text-sm font-medium text-forest group-hover:underline underline-offset-4">
                        {related.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-forest/70">
                      ₱{related.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  )
}
