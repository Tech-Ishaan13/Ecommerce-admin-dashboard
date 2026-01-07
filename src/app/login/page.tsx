import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { authService } from '@/services/auth'
import { LoginForm } from '@/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage() {
  // Check if user is already logged in
  const cookieStore = cookies()
  const token = cookieStore.get('admin-token')?.value

  if (token) {
    const user = await authService.verifySession(token)
    if (user) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            E-commerce Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Demo Credentials:</p>
          <p className="font-mono">admin@ecommerce.com / admin123456</p>
        </div>
      </div>
    </div>
  )
}