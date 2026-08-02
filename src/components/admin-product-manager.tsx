"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import type { Product, Category, ProductStatus } from "@/types/database"
import { createProduct, updateProduct, deleteProduct, type ProductFormData } from "@/app/admin/products/actions"
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, Loader2, Upload, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type AdminProductManagerProps = {
  products: (Product & { category: Category })[]
  categories: Category[]
}

export default function AdminProductManager({
  products,
  categories,
}: AdminProductManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: categories[0]?.id || "",
    image_url: "",
    status: "active",
  })

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      const matchCat = !selectedCategory || p.category_id === selectedCategory
      const matchStatus = !selectedStatus || p.status === selectedStatus

      return matchSearch && matchCat && matchStatus
    })
  }, [products, search, selectedCategory, selectedStatus])

  const openCreateDialog = () => {
    setEditingProduct(null)
    setForm({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category_id: categories[0]?.id || "",
      image_url: "",
      status: "active",
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      image_url: product.image_url || "",
      status: product.status,
    })
    setFormError(null)
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setFormError(null)

    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop() || "jpg"
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(fileName)

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }))
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image to Supabase Storage.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.name.trim()) {
      setFormError("Product name is required.")
      return
    }
    if (!form.category_id) {
      setFormError("Please select a category.")
      return
    }

    setLoading(true)
    let res

    if (editingProduct) {
      res = await updateProduct(editingProduct.id, form)
    } else {
      res = await createProduct(form)
    }

    setLoading(false)

    if (res.success) {
      setIsDialogOpen(false)
    } else {
      setFormError(res.error || "Failed to save product.")
    }
  }

  const handleDelete = async () => {
    if (!deletingProductId) return
    setLoading(true)

    const res = await deleteProduct(deletingProductId)
    setLoading(false)

    if (res.success) {
      setDeletingProductId(null)
    } else {
      alert(res.error || "Failed to delete product.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>

        {/* Filters + Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-forest/15 bg-light py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest/70 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-forest/15 bg-light py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest/70 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 bg-forest-ghost-white transition-colors hover:bg-forest-light"
          >
            <Plus className="size-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-champagne/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 bg-champagne flex-shrink-0 overflow-hidden rounded-sm border border-forest/15">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[9px] text-forest/40">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-forest">{product.name}</p>
                          <p className="text-[10px] text-forest/40 line-clamp-1 max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-forest/60 font-medium">
                      {product.category?.name}
                    </td>
                    <td className="py-3 px-4 font-medium text-forest">
                      ₱{Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-medium">{product.stock}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-sm ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "out_of_stock"
                            ? "bg-red-100 text-red-800"
                            : "bg-champagne text-forest/60"
                        }`}
                      >
                        {product.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(product)}
                          className="p-1.5 text-forest/50 hover:text-forest transition-colors"
                          aria-label="Edit product"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProductId(product.id)}
                          className="p-1.5 text-forest/50 hover:text-red-600 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-forest/40">
                    No products match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-light p-6 shadow-xl border border-forest/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-forest/15 pb-4 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-forest">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-forest/40 hover:text-forest/70"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 border border-red-200 text-xs rounded-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Category *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Product Image Upload Zone */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Product Image *
                </label>
                
                <div className="space-y-3">
                  {/* Thumbnail Preview if Image Exists */}
                  {form.image_url ? (
                    <div className="relative aspect-[3/4] w-32 overflow-hidden rounded-xs border border-forest/15 bg-champagne group">
                      <Image
                        src={form.image_url}
                        alt="Product preview"
                        width={200}
                        height={266}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove Image"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {/* Upload Button Input */}
                  <div className="relative border-2 border-dashed border-forest/20 rounded-xs p-4 text-center hover:border-forest/40 transition-colors bg-champagne/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="size-6 text-forest animate-spin mb-1" />
                          <p className="text-xs font-semibold text-forest">Uploading to Supabase Storage...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="size-6 text-forest/50 mb-1" />
                          <p className="text-xs font-semibold text-forest">
                            {form.image_url ? "Replace Image File" : "Upload Image File"}
                          </p>
                          <p className="text-[10px] text-forest/40">
                            JPG, PNG, WEBP up to 5MB (Direct to Supabase Storage)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fallback Image URL Input */}
                  <div className="pt-1">
                    <details className="text-[11px] text-forest/50 cursor-pointer">
                      <summary className="hover:text-forest transition-colors">Or enter Image URL manually</summary>
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full border border-forest/15 p-2 mt-2 text-forest focus:outline-none focus:border-forest/40"
                      />
                    </details>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-forest/15 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2.5 uppercase tracking-wider font-semibold border border-forest/15 text-forest/60 hover:bg-champagne"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-6 py-2.5 uppercase tracking-wider font-semibold bg-forest-ghost-white hover:bg-forest-light disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="size-3.5 animate-spin" />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-light p-6 shadow-xl border border-forest/15 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-forest">Confirm Product Deletion</h3>
              <p className="text-xs text-forest/50 mt-1">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border border-forest/15 text-forest/60 hover:bg-champagne"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2.5 text-xs uppercase tracking-wider font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
