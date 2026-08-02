import AdminSidebar from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-light text-forest">
        <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-8 lg:p-12">{children}</div>
    </div>
  );
}
