import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database initialization...')
    
    // First, try to create tables if they don't exist
    try {
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'admin',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "products" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DOUBLE PRECISION NOT NULL,
        "cost_price" DOUBLE PRECISION,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "low_stock_threshold" INTEGER DEFAULT 10,
        "category" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "specifications" TEXT,
        "tags" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "product_images" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "product_id" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "alt_text" TEXT,
        "is_primary" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "sales_data" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "product_id" TEXT,
        "quantity" INTEGER NOT NULL,
        "unit_price" DOUBLE PRECISION NOT NULL,
        "total_amount" DOUBLE PRECISION NOT NULL,
        "sale_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      console.log('Tables created successfully')
    } catch (tableError) {
      console.log('Tables might already exist:', tableError)
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findFirst()

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already initialized',
        admin: { email: existingAdmin.email, name: existingAdmin.name }
      })
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123456', 12)
    
    const admin = await prisma.adminUser.create({
      data: {
        id: 'admin-' + Date.now(),
        email: 'admin@ecommerce.com',
        passwordHash,
        name: 'Admin User',
        role: 'super_admin'
      }
    })

    // Create sample products
    const sampleProducts = [
      {
        id: 'prod-1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        costPrice: 120.00,
        stock: 50,
        category: 'Electronics',
        status: 'active'
      },
      {
        id: 'prod-2',
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking',
        price: 299.99,
        costPrice: 180.00,
        stock: 30,
        category: 'Electronics',
        status: 'active'
      },
      {
        id: 'prod-3',
        name: 'Coffee Mug',
        description: 'Premium ceramic coffee mug',
        price: 24.99,
        costPrice: 12.00,
        stock: 100,
        category: 'Home & Kitchen',
        status: 'active'
      }
    ]

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product })
    }

    // Create sample sales data
    const salesData = []
    for (let i = 0; i < 20; i++) {
      const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      const quantity = Math.floor(Math.random() * 5) + 1
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30))

      salesData.push({
        id: 'sale-' + i,
        productId: randomProduct.id,
        quantity,
        unitPrice: randomProduct.price,
        totalAmount: randomProduct.price * quantity,
        saleDate
      })
    }

    await prisma.salesData.createMany({ data: salesData })

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with sample data!',
      admin: { email: admin.email, name: admin.name, password: 'admin123456' }
    })

  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to initialize database: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}