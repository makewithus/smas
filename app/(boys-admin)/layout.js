'use client'

import AdminLayout from '@/src/components/layout/AdminLayout'

export default function BoysAdminLayout({ children }) {
  return (
    <AdminLayout portal="boys">
      {children}
    </AdminLayout>
  )
}
