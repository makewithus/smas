'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { INSTITUTION } from '@/src/lib/constants'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
]

export default function PublicNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8DFD4]">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12 shrink-0">
            <Image 
              src="/smas_logo.png" 
              alt="SMAS Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg text-brand leading-tight">
              {INSTITUTION.name}
            </span>
            <span className="text-xs text-neutral-600 leading-tight">
              Vottancheri
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`text-base transition-colors relative pb-0.5 ${
                  isActive
                    ? 'text-brand font-medium'
                    : 'text-neutral-900 hover:text-brand'
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden md:inline-flex btn-primary"
          >
            Admin Login
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-900 hover:text-brand"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-80 border-b border-[#E8DFD4]' : 'max-h-0'
        }`}
      >
        <div className="bg-white px-6 py-4 space-y-3">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`block py-2 text-base transition-colors ${
                  isActive 
                    ? 'text-brand font-medium' 
                    : 'text-neutral-900 hover:text-brand'
                }`}
              >
                {label}
              </Link>
            )
          })}
          <Link
            href="/login"
            className="block w-full text-center btn-primary mt-4"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  )
}
