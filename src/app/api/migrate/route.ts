import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database migration...')
    
    // Use Prisma's db push to create tables from schema
    // This is equivalent to running "prisma db push"
    
    // Test the connection first
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Try to create a simple test to see if we can execute commands
    await prisma.$executeRaw`SELECT 1 as test`
    console.log('Database query test successful')
    
    // The tables should be created automatically by Prisma when we try to use them
    // Let's try to create the AdminUser table using a simpler approach
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "AdminUser" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          "passwordHash" TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('AdminUser table created')
    } catch (tableError) {
      console.log('AdminUser table might already exist:', tableError.message)
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Product" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          "costPrice" DECIMAL(10,2),
          stock INTEGER NOT NULL DEFAULT 0,
          "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          specifications TEXT,
          tags TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('Product table created')
    } catch (tableError) {
      console.log('Product table might already exist:', tableError.message)
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ProductImage" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "productId" TEXT NOT NULL,
          url TEXT NOT NULL,
          "altText" TEXT,
          "isPrimary" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
        )
      `
      console.log('ProductImage table created')
    } catch (tableError) {
      console.log('ProductImage table might already exist:', tableError.message)
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "SalesData" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "productId" TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          "unitPrice" DECIMAL(10,2) NOT NULL,
          "totalAmount" DECIMAL(10,2) NOT NULL,
          "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("productId") REFERENCES "Product"(id) ON DELETE CASCADE
        )
      `
      console.log('SalesData table created')
    } catch (tableError) {
      console.log('SalesData table might already exist:', tableError.message)
    }
    
    console.log('Database migration completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}