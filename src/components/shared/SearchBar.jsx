'use client'

import { Search, X } from 'lucide-react'

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  width = '280px',
  className = ''
}) {
  return (
    <div className={`relative ${className}`} style={{ width }}>
      <Search 
        size={15} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[38px] pl-9 pr-8 text-sm rounded-md border border-[#E8DFD4] bg-white text-neutral-900 placeholder:text-neutral-500 focus:border-brand focus:ring-0"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
