"use client"

import Image from "next/image"
import Link from "next/link"
import { Globe, ArrowRight } from "lucide-react"

const footerLinks = {
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
      <div className="mx-auto w-full px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 items-start">
          {/* Brand & Socials Column */}
          <div className="flex flex-col items-center text-center space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/brand-white.png"
                alt="ATELYR"
                width={160}
                height={40}
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-4 pt-2 text-ghost-white/60">
              <a
                href="#"
                aria-label="Instagram"
                className="transition-colors hover:text-champagne cursor-pointer"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="transition-colors hover:text-champagne cursor-pointer"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.417V8z"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Twitter / X"
                className="transition-colors hover:text-champagne cursor-pointer"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="Website"
                className="transition-colors hover:text-champagne cursor-pointer"
              >
                <Globe className="size-4" />
              </a>
            </div>
          </div>

          {/* Shared Column: Company & Support Links*/}
          <div className="flex items-start justify-center gap-12 sm:gap-16">
            {/* Company Section */}
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white mb-3">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-ghost-white/60 transition-colors hover:text-champagne"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white mb-3">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-ghost-white/60 transition-colors hover:text-champagne"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-ghost-white">
              Newsletter
            </h3>
            <p className="text-xs leading-relaxed text-ghost-white/60 max-w-xs">
              Subscribe for exclusive updates and private collection previews.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 pt-1 w-full max-w-xs">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-ghost-white/10 border border-ghost-white/20 py-2 px-3 text-xs text-ghost-white placeholder:text-ghost-white/40 focus:border-champagne focus:outline-none rounded-xs"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-champagne py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest transition-colors hover:bg-champagne-dark cursor-pointer rounded-xs"
                aria-label="Subscribe"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </form>
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
