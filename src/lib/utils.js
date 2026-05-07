import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Classname utility
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date to "15 Jan 2024"
export function formatDate(timestamp) {
  if (!timestamp) return ''
  
  let date
  if (timestamp?.toDate) {
    // Firestore Timestamp
    date = timestamp.toDate()
  } else if (timestamp?.seconds) {
    // Firestore Timestamp as plain object
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Format date to "15/01/24"
export function formatDateShort(timestamp) {
  if (!timestamp) return ''
  
  let date
  if (timestamp?.toDate) {
    date = timestamp.toDate()
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  
  return `${day}/${month}/${year}`
}

// Format currency to "Rs. 5,200"
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return 'Rs. 0'
  
  const num = Number(amount)
  return `Rs. ${num.toLocaleString('en-IN')}`
}

// Convert amount to words
export function amountToWords(amount) {
  if (!amount || amount === 0) return 'Zero Only'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
                'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  function convertHundreds(num) {
    let result = ''
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + ' Hundred '
      num %= 100
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)] + ' '
      num %= 10
    }
    
    if (num > 0) {
      result += ones[num] + ' '
    }
    
    return result.trim()
  }
  
  let num = Math.floor(Number(amount))
  if (num === 0) return 'Zero Only'
  
  let result = ''
  
  // Crore (10 million)
  if (num >= 10000000) {
    result += convertHundreds(Math.floor(num / 10000000)) + ' Crore '
    num %= 10000000
  }
  
  // Lakh (100 thousand)
  if (num >= 100000) {
    result += convertHundreds(Math.floor(num / 100000)) + ' Lakh '
    num %= 100000
  }
  
  // Thousand
  if (num >= 1000) {
    result += convertHundreds(Math.floor(num / 1000)) + ' Thousand '
    num %= 1000
  }
  
  // Hundreds
  if (num > 0) {
    result += convertHundreds(num)
  }
  
  return result.trim() + ' Only'
}

// Generate student ID
export function generateStudentId(portal, count) {
  const prefix = portal === 'boys' ? 'B' : 'G'
  const year = new Date().getFullYear()
  const paddedCount = String(count + 1).padStart(4, '0')
  return `STU-${prefix}-${year}-${paddedCount}`
}

// Generate receipt number
export function generateReceiptNumber(portal, count) {
  const prefix = portal === 'boys' ? 'B' : 'G'
  const year = new Date().getFullYear()
  const paddedCount = String(count + 1).padStart(4, '0')
  return `RCP-${prefix}-${year}-${paddedCount}`
}

// Generate expense ID
export function generateExpenseId(portal, count) {
  const prefix = portal === 'boys' ? 'B' : 'G'
  const year = new Date().getFullYear()
  const paddedCount = String(count + 1).padStart(4, '0')
  return `EXP-${prefix}-${year}-${paddedCount}`
}

// Get portal label
export function getPortalLabel(portal) {
  if (portal === 'boys') return 'Boys Portal'
  if (portal === 'girls') return 'Girls Portal'
  return 'Super Admin'
}

// Get initials from name
export function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Truncate string
export function truncate(str, length) {
  if (!str) return ''
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

// Sleep utility for testing
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Get relative time
export function getRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  let date
  if (timestamp?.toDate) {
    date = timestamp.toDate()
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else {
    date = new Date(timestamp)
  }
  
  const now = new Date()
  const diffMs = now - date
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return formatDate(timestamp)
}

// Debounce function
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function numberToWords(n) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  if (n === 0) return 'Zero'
  if (n < 20) return ones[n]
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '')
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '')
  return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '')
}

export function generateRollNumber(classVal, section, count) {
  const sec = section ? section.toUpperCase() : 'A'
  return `${classVal || 'X'}${sec}${String(count + 1).padStart(3, '0')}`
}

export function exportToCSV(data, filename = 'export') {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
