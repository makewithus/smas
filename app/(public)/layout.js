import PublicNavbar from '@/src/components/layout/PublicNavbar'
import PublicFooter from '@/src/components/layout/PublicFooter'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-[100dvh] flex flex-col w-full">
      <PublicNavbar />
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
