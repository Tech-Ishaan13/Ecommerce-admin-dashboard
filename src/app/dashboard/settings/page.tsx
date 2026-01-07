import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authService } from '@/services/auth'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage() {
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

  return <SettingsClient user={user} />
}
}