"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import type { Product, Category, ProductStatus } from "@/types/database"
import { createProduct, updateProduct, deleteProduct, type ProductFormData } from "@/app/admin/products/actions"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Package,
  Filter,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Pagination } from "@/components/ui/pagination"

type AdminProductManagerProps = {
  products: (Product & { category: Category })[]
  categories: Category[]
}

const ITEMS_PER_PAGE = 10

export default function AdminProductManager({
  products,
  categories,
}: AdminProductManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory, selectedStatus])

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

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const deletingProduct = useMemo(() => {
    return products.find((p) => p.id === deletingProductId) || null
  }, [products, deletingProductId])

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
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>

        {/* Filter Popover Button & Add Button */}
        <div className="flex items-center gap-3 justify-end">
          {/* Filter Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 border py-2.5 px-3.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
                isFilterOpen || (selectedCategory || selectedStatus)
                  ? "border-forest bg-champagne text-forest"
                  : "border-forest/15 bg-light text-forest/70 hover:border-forest/30 hover:text-forest"
              }`}
              title="Filter Products"
            >
              <Filter className="size-4" />
            </button>

            {/* Filter Popover Dropdown Menu */}
            {isFilterOpen && (
              <>
                {/* Invisible Backdrop for click-away */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsFilterOpen(false)}
                />

                <div className="absolute right-0 top-full mt-2 z-30 w-40 bg-light border border-forest/15 shadow-xl p-4 space-y-4 rounded-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-forest/15 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                      Filters
                    </span>
                    {(selectedCategory || selectedStatus) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory("")
                          setSelectedStatus("")
                        }}
                        className="text-[11px] font-medium text-forest/60 hover:text-forest underline transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest/50">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-forest/15 bg-light py-2 px-2.5 text-xs font-medium text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-forest/50">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-forest/15 bg-light py-2 px-2.5 text-xs font-medium text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Add Product Button */}
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 bg-forest px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-all hover:bg-forest-light shadow-md hover:shadow-lg hover:cursor-pointer rounded-xs"
            title="Add a product"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 font-semibold">Product</th>
                <th className="py-4 px-5 font-semibold">Category</th>
                <th className="py-4 px-5 font-semibold">Price</th>
                <th className="py-4 px-5 font-semibold">Stock</th>
                <th className="py-4 px-5 font-semibold">Status</th>
                <th className="py-4 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-champagne/50 transition-colors">
                    {/* Product cell with larger thumbnail & line spacing */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="size-14 bg-champagne flex-shrink-0 overflow-hidden rounded-xs border border-forest/15">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[9px] text-forest/40">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-forest">{product.name}</p>
                          <p className="text-xs text-forest/40 line-clamp-1 max-w-xs mt-0.5">
                            {product.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-forest/70 font-medium text-xs">
                      {product.category?.name}
                    </td>
                    <td className="py-4 px-5 font-semibold text-forest text-xs">
                      ₱{Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 font-medium text-xs text-forest">{product.stock}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase rounded-xs ${
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
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(product)}
                          className="p-2 text-forest/50 hover:text-forest transition-colors hover:cursor-pointer"
                          aria-label="Edit product"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProductId(product.id)}
                          className="p-2 text-forest/50 hover:text-red-600 transition-colors hover:cursor-pointer"
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
                  <td colSpan={6} className="py-16 text-center text-forest/40">
                    <Package className="size-8 mx-auto mb-2 opacity-40" />
                    No products match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Max 10 per page) */}
        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-forest/15 bg-light">
            <p className="text-xs text-forest/60">
              Showing{" "}
              <span className="font-semibold text-forest">
                {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-forest">
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-forest">{filtered.length}</span> products
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="pt-0 justify-end"
            />
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-light p-6 sm:p-8 shadow-2xl border border-forest/15 max-h-[90vh] overflow-y-auto rounded-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-forest/15 pb-4 mb-6">
              <h2 className="text-base font-semibold uppercase tracking-widest text-forest">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 text-forest/40 hover:text-forest transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 bg-red-50 text-red-700 p-3 border border-red-200 text-xs font-medium rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Blend Blazer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-forest/15 bg-light p-3 text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40 rounded-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Category *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-forest/15 bg-light p-3 text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
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
                  <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-forest/15 bg-light p-3 text-forest focus:outline-none focus:border-forest/40 rounded-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-forest/15 bg-light p-3 text-forest focus:outline-none focus:border-forest/40 rounded-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })}
                  className="w-full border border-forest/15 bg-light p-3 text-forest focus:outline-none focus:border-forest/40 cursor-pointer rounded-xs"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Product Image Upload Zone */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Product Image *
                </label>
                
                <div className="space-y-3">
                  {/* Thumbnail Preview if Image Exists */}
                  {form.image_url ? (
                    <div className="relative aspect-[3/4] w-28 overflow-hidden rounded-xs border border-forest/15 bg-champagne group">
                      <Image
                        src={form.image_url}
                        alt="Product preview"
                        width={150}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: "" })}
                        className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {/* Upload Button Input */}
                  <div className="relative border-2 border-dashed border-forest/20 rounded-xs p-5 text-center hover:border-forest/40 transition-colors bg-champagne/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 size-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="size-6 text-forest animate-spin mb-1" />
                          <p className="text-xs font-semibold text-forest">Uploading to Supabase Storage...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="size-6 text-forest/50 mb-1" />
                          <p className="text-xs font-semibold text-forest">
                            {form.image_url ? "Replace Image File" : "Upload Product Image"}
                          </p>
                          <p className="text-[10px] text-forest/40">
                            JPG, PNG, WEBP up to 5MB (Saved directly to Supabase Storage)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fallback Image URL Input */}
                  <div className="pt-1">
                    <details className="text-[11px] text-forest/50 cursor-pointer">
                      <summary className="hover:text-forest transition-colors font-medium">Or enter Image URL manually</summary>
                      <input
                        type="url"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full border border-forest/15 p-2.5 mt-2 text-forest focus:outline-none focus:border-forest/40 rounded-xs"
                      />
                    </details>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed product specifications, materials, and care instructions..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-forest/15 bg-light p-3 text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40 resize-none rounded-xs"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-forest/15 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider border border-forest/15 text-forest/70 hover:bg-champagne transition-colors cursor-pointer rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-wider bg-forest text-ghost-white hover:bg-forest-light transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-sm rounded-xs"
                >
                  {loading && <Loader2 className="size-3.5 animate-spin" />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Confirm Delete Modal (Matching Storefront Removal Modal Design) */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-light p-6 shadow-2xl border border-forest/15 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-semibold uppercase tracking-wider text-forest">
                Delete Product?
              </h3>
              <p className="text-xs font-medium text-forest/70 mt-2">
                {deletingProduct?.name || "This action cannot be undone."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider bg-forest text-ghost-white hover:bg-forest-light transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Delete Product
              </button>
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider border border-forest/15 text-forest/70 hover:bg-champagne transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
