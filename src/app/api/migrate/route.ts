import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database migration...')
    
    // Push the schema to create tables
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    
    // Create tables manually if needed
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AdminUser" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
      )
    `
    
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email")
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10,2) NOT NULL,
        "costPrice" DECIMAL(10,2),
        "stock" INTEGER NOT NULL DEFAULT 0,
        "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
        "category" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "specifications" TEXT,
        "tags" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ProductImage" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "altText" TEXT,
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SalesData" (
        "id" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        "totalAmount" DECIMAL(10,2) NOT NULL,
        "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SalesData_pkey" PRIMARY KEY ("id")
      )
    `
    
    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "ProductImage" 
      ADD CONSTRAINT IF NOT EXISTS "ProductImage_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `
    
    await prisma.$executeRaw`
      ALTER TABLE "SalesData" 
      ADD CONSTRAINT IF NOT EXISTS "SalesData_productId_fkey" 
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `
    
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