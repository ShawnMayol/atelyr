"use client"

import { useState } from "react"
import { loginAdmin } from "./actions"
import { Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      <div className="w-full max-w-md space-y-6 bg-forest-dark p-8 border border-champagne/15 shadow-2xl">
        <div className="text-center pt-2">
          <div className="flex justify-center mb-3">
            <Image
              src="/brand.png"
              alt="ATELYR"
              width={160}
              height={40}
              priority
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>

          <h1 className="text-xs font-medium tracking-widest uppercase text-ghost-white/60">
            Admin Authentication
          </h1>
        </div>

        {error && (
          <div className="border border-red-800 bg-red-950/50 p-4 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-ghost-white/70 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ghost-white/40 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@atelyr.com"
                className="w-full border border-champagne/15 bg-forest py-3 pl-11 pr-4 text-sm text-ghost-white placeholder:text-ghost-white/40 focus:border-ghost-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium tracking-wide uppercase text-ghost-white/70 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ghost-white/40 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full border border-champagne/15 bg-forest py-3 pl-11 pr-11 text-sm text-ghost-white placeholder:text-ghost-white/40 focus:border-ghost-white/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ghost-white/40 hover:text-ghost-white transition-colors cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-champagne px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-forest transition-colors hover:bg-champagne-dark disabled:opacity-50 cursor-pointer"
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

        <div className="border-t border-champagne/15 pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-ghost-white/60 hover:text-ghost-white transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  )
}
