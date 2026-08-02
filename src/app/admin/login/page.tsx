"use client"

import { useState } from "react"
import { loginAdmin } from "./actions"
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await loginAdmin(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-forest-dark p-8 border border-champagne/15 shadow-2xl">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-ghost-white/60 hover:text-ghost-white mb-6 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Storefront
          </Link>
          <span className="block text-2xl font-semibold tracking-[0.3em] uppercase text-ghost-white mb-2">
            ATELYR
          </span>
          <h1 className="text-sm font-medium tracking-widest uppercase text-ghost-white/60">
            Admin Authentication
          </h1>
        </div>

        {error && (
          <div className="border border-red-800 bg-red-950/50 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-ghost-white/70 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ghost-white/40" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@atelyr.com"
                className="w-full border border-champagne/15 bg-forest py-3 pl-11 pr-4 text-sm text-ghost-white placeholder:text-ghost-white/40 focus:border-ghost-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-ghost-white/70 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ghost-white/40" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-champagne/15 bg-forest py-3 pl-11 pr-4 text-sm text-ghost-white placeholder:text-ghost-white/40 focus:border-ghost-white/30 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-champagne px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-forest transition-colors hover:bg-champagne-dark disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="border-t border-champagne/15 pt-6 text-center text-xs text-champagne/40">
          Demo Admin: <code className="text-champagne/70">admin@atelyr.com</code>
        </div>
      </div>
    </div>
  )
}

