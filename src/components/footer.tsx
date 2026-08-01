import Link from "next/link"

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "High-End Apparel", href: "/products?category=high-end-apparel" },
    { name: "Luxury Footwear", href: "/products?category=luxury-footwear" },
    { name: "Fine Leather Goods", href: "/products?category=fine-leather-goods" },
  ],
  company: [
    { name: "About Atelyr", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Careers", href: "#" },
  ],
  support: [
    { name: "Contact Us", href: "#" },
    { name: "Shipping & Returns", href: "#" },
    { name: "FAQ", href: "#" },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-forest/10 bg-forest text-ghost-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <span className="text-lg font-semibold tracking-[0.3em] uppercase text-ghost-white">
              Atelyr
            </span>
            <p className="text-sm leading-relaxed text-ghost-white/70">
              Curated luxury essentials for the discerning individual.
              Craftsmanship over logos, quality over trend.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ghost-white/60 transition-colors hover:text-champagne"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ghost-white/60 transition-colors hover:text-champagne"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ghost-white/60 transition-colors hover:text-champagne"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ghost-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-ghost-white/40">
            &copy; {new Date().getFullYear()} Atelyr. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-ghost-white/40 transition-colors hover:text-champagne">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-ghost-white/40 transition-colors hover:text-champagne">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
