"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  LogOut,
  Store,
} from "lucide-react"
import { logoutAdmin } from "@/app/admin/login/actions"

const navItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  // Hide sidebar on login page
  if (pathname === "/admin/login") return null

  return (
    <aside className="w-64 border-r border-forest/10 bg-forest flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand header */}
        <div className="flex h-16 items-center px-6 border-b border-champagne/15 justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/brand-white.png"
              alt="ATELYR"
              width={120}
              height={30}
              className="h-5 w-auto object-contain"
            />
            <span className="bg-champagne text-forest text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-sm transition-colors ${
                  isActive
                    ? "bg-champagne text-forest"
                    : "text-ghost-white/70 hover:bg-forest-light hover:text-ghost-white"
                }`}
              >
                <Icon className="size-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-champagne/15 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-ghost-white/60 hover:text-ghost-white transition-colors"
        >
          <Store className="size-4" />
          View Storefront
        </Link>

        <form action={logoutAdmin}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold tracking-wider uppercase text-red-400 hover:bg-red-950/30 transition-colors rounded-sm"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
