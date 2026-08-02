"use client"

import { useState } from "react"
import type { Category } from "@/types/database"
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/categories/actions"
import { Plus, Edit2, Trash2, X, AlertTriangle, Loader2 } from "lucide-react"

type CategoryWithProductCount = Category & {
  product_count?: number
}

type AdminCategoryManagerProps = {
  categories: CategoryWithProductCount[]
}

export default function AdminCategoryManager({
  categories,
}: AdminCategoryManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithProductCount | null>(null)

  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [guardError, setGuardError] = useState<string | null>(null)

  const openCreateDialog = () => {
    setEditingCategory(null)
    setCategoryName("")
    setFormError(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setFormError(null)
    setIsDialogOpen(true)
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
      res = await updateCategory(editingCategory.id, categoryName)
    } else {
      res = await createCategory(categoryName)
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
      <div className="flex justify-between items-center">
        <p className="text-xs text-forest/50">
          {categories.length} {categories.length === 1 ? "category" : "categories"} configured
        </p>

        <button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 bg-forest-ghost-white transition-colors hover:bg-forest-light"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-light border border-forest/15 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-champagne border-b border-forest/15 text-forest/50 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Category Name</th>
                <th className="py-3 px-4 font-semibold">Assigned Products</th>
                <th className="py-3 px-4 font-semibold">Created Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/15 text-forest/70">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-champagne/50">
                    <td className="py-3.5 px-4 font-medium text-forest">
                      {category.name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-forest/60">
                      {category.product_count || 0} product(s)
                    </td>
                    <td className="py-3.5 px-4 text-forest/50">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(category)}
                          className="p-1.5 text-forest/50 hover:text-forest transition-colors"
                          aria-label="Edit category"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingCategory(category)
                            setGuardError(null)
                          }}
                          className="p-1.5 text-forest/50 hover:text-red-600 transition-colors"
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
                  <td colSpan={4} className="py-12 text-center text-forest/40">
                    No categories created yet.
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
          <div className="w-full max-w-md bg-light p-6 shadow-xl border border-forest/15">
            <div className="flex items-center justify-between border-b border-forest/15 pb-4 mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-forest">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-forest/40 hover:text-forest/70"
              >
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-forest/50 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Fine Leather Goods"
                  className="w-full border border-forest/15 p-2.5 text-forest focus:outline-none focus:border-forest/40"
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
                  disabled={loading}
                  className="px-6 py-2.5 uppercase tracking-wider font-semibold bg-forest-ghost-white hover:bg-forest-light disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="size-3.5 animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Guard Logic */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-light p-6 shadow-xl border border-forest/15 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <AlertTriangle className="size-6" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-forest">Delete Category</h3>
              <p className="text-xs text-forest/50 mt-1">
                Are you sure you want to delete <span className="font-semibold text-forest">&quot;{deletingCategory.name}&quot;</span>?
              </p>
            </div>

            {guardError && (
              <div className="bg-red-50 border border-red-200 p-3 text-left text-xs text-red-600 font-medium">
                {guardError}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDeletingCategory(null)
                  setGuardError(null)
                }}
                className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border border-forest/15 text-forest/60 hover:bg-champagne"
              >
                Close
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2.5 text-xs uppercase tracking-wider font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
