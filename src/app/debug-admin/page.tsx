'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAdminPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAdminCreation = async () => {
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'TestPassword123!')
      formData.append('name', 'Test Admin')
      formData.append('role', 'admin')

      const response = await fetch('/api/admin/create-debug', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data
      })

    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testOriginalEndpoint = async () => {
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'TestPassword123!')
      formData.append('name', 'Test Admin')
      formData.append('role', 'admin')

      const response = await fetch('/api/admin/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult({
        status: response.status,
        statusText: response.statusText,
        data
      })

    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Creation Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testAdminCreation} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testing...' : 'Test Debug Endpoint'}
            </Button>
            
            <Button 
              onClick={testOriginalEndpoint} 
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Original Endpoint'}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}