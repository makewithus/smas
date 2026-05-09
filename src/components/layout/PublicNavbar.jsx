'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      <nav className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
            <span className="font-serif text-white text-lg">S</span>
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
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`text-base transition-colors relative pb-0.5 ${
                  isActive 
                    ? 'text-brand' 
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
        
        {/* Desktop Admin Login Button */}
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
