"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import type { Category } from "@/types/database"
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/categories/actions"
import { Plus, Edit2, Trash2, X, Loader2, Upload, Search, FolderTree } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Pagination } from "@/components/ui/pagination"

type CategoryWithProductCount = Category & {
  product_count?: number
}

type AdminCategoryManagerProps = {
  categories: CategoryWithProductCount[]
}

const ITEMS_PER_PAGE = 10

export default function AdminCategoryManager({
  categories,
}: AdminCategoryManagerProps) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState("")
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithProductCount | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [guardError, setGuardError] = useState<string | null>(null)

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // Filtered categories
  const filtered = useMemo(() => {
    return categories.filter((cat) =>
      !search || cat.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  // Paginated items
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const openCreateDialog = () => {
    setEditingCategory(null)
    setCategoryName("")
    setCategoryImage("")
    setFormError(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setCategoryImage(category.image_url || "")
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
      const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

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

      setCategoryImage(urlData.publicUrl)
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image to Supabase Storage.")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!categoryName.trim()) {
      setFormError("Category name is required.")
      return
    }

    setLoading(true)
    let res

    if (editingCategory) {
      res = await updateCategory(editingCategory.id, categoryName, categoryImage)
    } else {
      res = await createCategory(categoryName, categoryImage)
    }

    setLoading(false)

    if (res.success) {
      setIsDialogOpen(false)
    } else {
      setFormError(res.error || "Failed to save category.")
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    setLoading(true)
    setGuardError(null)

    const res = await deleteCategory(deletingCategory.id)
    setLoading(false)

    if (res.success) {
      setDeletingCategory(null)
    } else {
      setGuardError(res.error || "Failed to delete category.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-forest/40" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-forest/15 bg-light py-2.5 pl-10 pr-4 text-xs text-forest placeholder:text-forest/40 focus:border-forest/35 focus:outline-none"
          />
        </div>

        {/* Add Category Button */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 bg-forest px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-ghost-white transition-all hover:bg-forest-light shadow-md hover:shadow-lg hover:cursor-pointer rounded-xs"
            title="Add a category"
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
                <th className="py-4 px-5 font-semibold">Cover Image</th>
                <th className="py-4 px-5 font-semibold">Category</th>
                <th className="py-4 px-5 font-semibold">Assigned Products</th>
                <th className="py-4 px-5 font-semibold">Created Date</th>
                <th className="py-4 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-champagne/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="size-14 bg-champagne overflow-hidden rounded-xs border border-forest/15 flex items-center justify-center">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            width={56}
                            height={56}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-forest/40 uppercase font-medium">No image</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-sm text-forest">
                      {category.name}
                    </td>
                    <td className="py-4 px-5 font-medium text-xs text-forest/70">
                      {category.product_count || 0} product(s)
                    </td>
                    <td className="py-4 px-5 text-xs text-forest/50">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(category)}
                          className="p-2 text-forest/50 hover:text-forest transition-colors hover:cursor-pointer"
                          aria-label="Edit category"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingCategory(category)
                            setGuardError(null)
                          }}
                          className="p-2 text-forest/50 hover:text-red-600 transition-colors hover:cursor-pointer"
                          aria-label="Delete category"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-forest/40">
                    <FolderTree className="size-8 mx-auto mb-2 opacity-40" />
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Shadcn Pagination Bar */}
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
              of <span className="font-semibold text-forest">{filtered.length}</span> categories
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

      {/* Add / Edit Category Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-light p-6 sm:p-8 shadow-2xl border border-forest/15 max-h-[90vh] overflow-y-auto rounded-xs animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-forest/15 pb-4 mb-6">
              <h2 className="text-base font-semibold uppercase tracking-widest text-forest">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 text-forest/40 hover:text-forest transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Fine Leather Goods"
                  className="w-full border border-forest/15 bg-light p-3 text-forest focus:outline-none focus:border-forest/40 rounded-xs"
                />
              </div>

              {/* Category Cover Image Upload Zone */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/60 mb-1.5">
                  Cover Image
                </label>
                
                <div className="space-y-3">
                  {/* Thumbnail Preview if Image Exists */}
                  {categoryImage ? (
                    <div className="relative aspect-[4/5] w-28 overflow-hidden rounded-xs border border-forest/15 bg-champagne group">
                      <Image
                        src={categoryImage}
                        alt="Category cover preview"
                        width={150}
                        height={200}
                        unoptimized
                        className="h-full w-full object-cover object-center"
                      />
                      <button
                        type="button"
                        onClick={() => setCategoryImage("")}
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
                          <p className="text-xs font-semibold text-forest">Uploading image to Supabase...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="size-5 text-forest/50 mb-1" />
                          <p className="text-xs font-semibold text-forest">
                            {categoryImage ? "Replace Cover Image File" : "Upload Cover Image File"}
                          </p>
                          <p className="text-[10px] text-forest/40">
                            JPG, PNG, WEBP up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <div className="pt-1">
                    <details className="text-[11px] text-forest/50 cursor-pointer">
                      <summary className="hover:text-forest transition-colors font-medium">Or enter Image URL manually</summary>
                      <input
                        type="url"
                        value={categoryImage}
                        onChange={(e) => setCategoryImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full border border-forest/15 p-2.5 mt-2 text-forest focus:outline-none focus:border-forest/40 rounded-xs"
                      />
                    </details>
                  </div>
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean Confirm Delete Modal (Matching Storefront Removal Modal Design) */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-light p-6 shadow-2xl border border-forest/15 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-base font-semibold uppercase tracking-wider text-forest">
                Delete Category?
              </h3>
              <p className="text-xs font-medium text-forest/70 mt-2">
                {deletingCategory.name}
              </p>
            </div>

            {guardError && (
              <div className="bg-red-50 border border-red-200 p-3 text-left text-xs text-red-600 font-medium rounded-xs">
                {guardError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider bg-forest text-ghost-white hover:bg-forest-light transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Delete Category
              </button>
              <button
                onClick={() => {
                  setDeletingCategory(null)
                  setGuardError(null)
                }}
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
