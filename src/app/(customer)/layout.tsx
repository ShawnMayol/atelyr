import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-champagne-light text-forest">
      <Navbar />
        <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
