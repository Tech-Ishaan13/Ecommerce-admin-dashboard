'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function DatabaseSetup() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminCredentials, setAdminCredentials] = useState<{ email: string; password: string } | null>(null)

  const initializeDatabase = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch('/api/init-db')
      const result = await response.json()

      if (result.success) {
        setIsInitialized(true)
        setAdminCredentials({
          email: 'admin@ecommerce.com',
          password: 'admin123456'
        })
      } else {
        setError(result.error || 'Failed to initialize database')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database')
    } finally {
      setIsInitializing(false)
    }
  }

  if (isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-green-700">Database Initialized!</CardTitle>
          </div>
          <CardDescription>
            Your database has been set up successfully with sample data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adminCredentials && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Admin Login Credentials:</h4>
              <div className="space-y-1 text-sm">
                <div><strong>Email:</strong> {adminCredentials.email}</div>
                <div><strong>Password:</strong> {adminCredentials.password}</div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Please change this password after logging in!
              </p>
            </div>
          )}
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Setup Required</CardTitle>
        <CardDescription>
          Initialize your database with sample data and create an admin account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div className="space-y-2 text-sm text-gray-600">
          <p>This will create:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Admin user account</li>
            <li>Sample products</li>
            <li>Sample sales data</li>
          </ul>
        </div>

        <Button 
          onClick={initializeDatabase} 
          disabled={isInitializing}
          className="w-full"
        >
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            'Initialize Database'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}