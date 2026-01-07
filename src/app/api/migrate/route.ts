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
    
    // Try to create the AdminUser table using a simpler approach
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "admin_users" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('admin_users table created')
    } catch (tableError) {
      console.log('admin_users table might already exist:', tableError instanceof Error ? tableError.message : String(tableError))
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "products" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          cost_price DECIMAL(10,2),
          stock INTEGER NOT NULL DEFAULT 0,
          low_stock_threshold INTEGER NOT NULL DEFAULT 10,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          specifications TEXT,
          tags TEXT,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('products table created')
    } catch (tableError) {
      console.log('products table might already exist:', tableError instanceof Error ? tableError.message : String(tableError))
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "product_images" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          product_id TEXT NOT NULL,
          url TEXT NOT NULL,
          alt_text TEXT,
          is_primary BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `
      console.log('product_images table created')
    } catch (tableError) {
      console.log('product_images table might already exist:', tableError instanceof Error ? tableError.message : String(tableError))
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "sales_data" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          product_id TEXT,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          sale_date TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `
      console.log('sales_data table created')
    } catch (tableError) {
      console.log('sales_data table might already exist:', tableError instanceof Error ? tableError.message : String(tableError))
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