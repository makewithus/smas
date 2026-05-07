'use client'

import AdminLayout from '@/src/components/layout/AdminLayout'

export default function GirlsAdminLayout({ children }) {
  return (
    <AdminLayout portal="girls">
      {children}
    </AdminLayout>
  )
}
