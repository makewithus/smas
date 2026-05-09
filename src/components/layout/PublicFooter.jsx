import Link from 'next/link'
import { Globe, Share2, Youtube, Phone, Mail, MapPin } from 'lucide-react'
import { INSTITUTION } from '@/src/lib/constants'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/contact', label: 'Contact' },
]

export default function PublicFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-brand text-white">
      <div className="max-w-[300] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* About Column */}
          <div>
            <h3 className="font-serif text-lg text-white mb-3">
              {INSTITUTION.name}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              A comprehensive student management and administration system designed 
              for educational institutions to manage students, receipts, expenses, 
              events, and notices efficiently.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://${INSTITUTION.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Website"
              >
                <Globe size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Share"
              >
                <Share2 size={20} />
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-white/50 mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone size={14} className="text-white/70 mt-1 shrink-0" />
                <a 
                  href={`tel:${INSTITUTION.phone.replace(/\s/g, '')}`}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {INSTITUTION.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={14} className="text-white/70 mt-1 shrink-0" />
                <a 
                  href={`mailto:${INSTITUTION.email}`}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  {INSTITUTION.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-white/70 mt-1 shrink-0" />
                <span className="text-sm text-white/80">
                  {INSTITUTION.address}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/50">
            {currentYear} {INSTITUTION.name}. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Run by Hudaibiyya Islamic Charitable Trust
          </p>
        </div>
      </div>
    </footer>
  )
}
