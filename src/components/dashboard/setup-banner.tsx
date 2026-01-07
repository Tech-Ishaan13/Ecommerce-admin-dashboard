'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Database, Image, CheckCircle } from 'lucide-react'

interface SetupBannerProps {
  hasData: boolean
}

export function SetupBanner({ hasData }: SetupBannerProps) {
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  const [dataGenerated, setDataGenerated] = useState(false)
  const [hasCloudinaryConfig, setHasCloudinaryConfig] = useState(true) // Default to true
  const [configLoaded, setConfigLoaded] = useState(false)

  // Check configuration status
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/config/status')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setHasCloudinaryConfig(result.data.cloudinary)
          }
        }
      } catch (error) {
        console.error('Failed to check config status:', error)
      } finally {
        setConfigLoaded(true)
      }
    }

    checkConfig()
  }, [])

  const handleGenerateSampleData = async () => {
    setIsGeneratingData(true)
    try {
      const response = await fetch('/api/init-sample-data', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        setDataGenerated(true)
        // Refresh the page after a short delay to show updated dashboard
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        console.error('Failed to generate sample data')
      }
    } catch (error) {
      console.error('Error generating sample data:', error)
    } finally {
      setIsGeneratingData(false)
    }
  }

  // Don't show banner if everything is configured and we have data
  if (hasData && hasCloudinaryConfig && configLoaded) {
    return null
  }

  // Don't show until config is loaded to avoid flashing
  if (!configLoaded) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Dashboard Setup Required
        </CardTitle>
        <CardDescription className="text-orange-700">
          Complete the setup to see real dashboard data and enable all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sample Data Setup */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {hasData || dataGenerated ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <Database className="h-5 w-5 text-orange-600 mt-0.5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-orange-800">Sales Data</h4>
              <p className="text-sm text-orange-700 mb-2">
                {hasData || dataGenerated 
                  ? 'Sample sales data is available. Dashboard shows real metrics.'
                  : 'Generate sample sales data to populate dashboard charts and metrics.'
                }
              </p>
              {!hasData && !dataGenerated && (
                <Button
                  onClick={handleGenerateSampleData}
                  disabled={isGeneratingData}
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  {isGeneratingData ? 'Generating...' : 'Generate Sample Data'}
                </Button>
              )}
              {dataGenerated && (
                <p className="text-sm text-green-700 font-medium">
                  ✓ Sample data generated! Refreshing dashboard...
                </p>
              )}
            </div>
          </div>

          {/* Cloudinary Setup */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {hasCloudinaryConfig ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <Image className="h-5 w-5 text-orange-600 mt-0.5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-orange-800">Image Uploads</h4>
              <p className="text-sm text-orange-700 mb-2">
                {hasCloudinaryConfig 
                  ? 'Cloudinary is configured. Image uploads are working.'
                  : 'Configure Cloudinary environment variables to enable image uploads.'
                }
              </p>
              {!hasCloudinaryConfig && (
                <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                  <p className="font-medium mb-1">Required environment variables:</p>
                  <ul className="space-y-0.5">
                    <li>• CLOUDINARY_CLOUD_NAME</li>
                    <li>• CLOUDINARY_API_KEY</li>
                    <li>• CLOUDINARY_API_SECRET</li>
                  </ul>
                  <p className="mt-1">
                    Add these to your Vercel environment variables or .env file.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}