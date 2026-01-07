import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check Cloudinary configuration
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )

    return NextResponse.json({
      success: true,
      data: {
        cloudinary: hasCloudinaryConfig,
        database: !!process.env.DATABASE_URL,
        jwt: !!process.env.JWT_SECRET,
      },
    })
  } catch (error) {
    console.error('Config status error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIG_STATUS_ERROR',
          message: 'Failed to check configuration status',
        },
      },
      { status: 500 }
    )
  }
}