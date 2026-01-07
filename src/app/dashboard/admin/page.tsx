import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authService } from '@/services/auth'
import { AdminManagementClient } from '@/components/admin/admin-management-client'

export default async function AdminManagementPage() {
  // Get token from cookies
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) {
    redirect('/login')
  }

  // Verify session and check if user is super admin
  const user = await authService.verifySession(token)
  
  if (!user || user.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Fetch real admin users from database
  let adminUsers = []
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/list`, {
      headers: {
        'Cookie': `admin-token=${token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        adminUsers = result.data
      }
    }
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    // Fallback to sample data
    adminUsers = [
      {
        id: '1',
        name: 'Ishaan Arora',
        email: 'ishaan_a@cs.iitr.ac.in',
        role: 'super_admin',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-07')
      }
    ]
  }

  return (
    <AdminManagementClient initialAdminUsers={adminUsers} currentUser={user} />
  )
}