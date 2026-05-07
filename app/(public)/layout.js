import PublicNavbar from '@/src/components/layout/PublicNavbar'
import PublicFooter from '@/src/components/layout/PublicFooter'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
