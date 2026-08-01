import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartDrawer from "@/components/cart-drawer"

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-light text-forest relative min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
