import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authService } from '@/services/auth'
import { QueryProvider } from '@/components/providers/query-provider'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get token from cookies
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) {
    redirect('/login')
  }

  // Verify session
  const user = await authService.verifySession(token)
  
  if (!user) {
    redirect('/login')
  }

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav user={user} />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}