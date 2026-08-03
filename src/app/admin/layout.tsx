"use client"

import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-light text-forest">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-12">{children}</div>
    </div>
  )
}
