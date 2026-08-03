"use client"

import { useState, useEffect } from "react"
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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile/tablet screens (< 768px) and auto-collapse
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Hide sidebar on login page
  if (pathname === "/admin/login") return null

  const handleLinkClick = () => {
    if (isMobile) {
      setIsCollapsed(true)
    }
  }

  const isOverlayOnMobile = isMobile && !isCollapsed

  return (
    <>
      {/* Mobile Backdrop Overlay when sidebar is expanded */}
      {isOverlayOnMobile && (
        <div
          className="fixed inset-0 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Spacer in flex layout on mobile when overlay is active to prevent content shift */}
      {isOverlayOnMobile && (
        <div className="w-16 shrink-0 md:hidden" aria-hidden="true" />
      )}

      <aside
        className={`border-r border-forest/10 bg-forest flex flex-col justify-between h-screen text-ghost-white shrink-0 ${
          isOverlayOnMobile
            ? "fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
            : `sticky top-0 z-30 ${isCollapsed ? "w-16 sm:w-20" : "w-64"}`
        }`}
      >
        <div>
          {/* Brand header & Toggle button */}
          <div
            className={`flex h-16 items-center border-b border-champagne/15 ${
              isCollapsed ? "justify-center px-2" : "justify-between px-6"
            }`}
          >
            {!isCollapsed && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className="flex items-center gap-2 overflow-hidden"
              >
                <Image
                  src="/brand-white.png"
                  alt="ATELYR"
                  width={120}
                  height={30}
                  className="h-5 w-auto object-contain"
                />
                <span className="bg-champagne text-forest text-[9px] font-semibold tracking-wider uppercase px-1.5 py-1 rounded">
                  Admin
                </span>
              </Link>
            )}

            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-ghost-white/70 hover:text-ghost-white rounded-sm transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-sm transition-colors ${
                    isCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "bg-champagne text-forest"
                      : "text-ghost-white/70 hover:bg-forest-light hover:text-ghost-white"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Actions */}
        <div className="p-3 border-t border-champagne/15 space-y-2">
          <Link
            href="/"
            target="_blank"
            onClick={handleLinkClick}
            title={isCollapsed ? "View Storefront" : undefined}
            className={`flex items-center gap-3 py-2 text-xs font-medium text-ghost-white/60 hover:text-ghost-white transition-colors ${
              isCollapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            <Store className="size-4 shrink-0" />
            {!isCollapsed && <span className="truncate">View Storefront</span>}
          </Link>

          <form action={logoutAdmin}>
            <button
              type="submit"
              title={isCollapsed ? "Sign Out" : undefined}
              className={`flex w-full items-center gap-3 py-2 text-xs font-semibold tracking-wider uppercase text-red-400 transition-colors rounded-sm cursor-pointer ${
                isCollapsed ? "justify-center px-0" : "px-3"
              }`}
            >
              <LogOut className="size-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
