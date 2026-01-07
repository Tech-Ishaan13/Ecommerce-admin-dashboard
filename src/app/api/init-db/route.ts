import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@ecommerce.com' }
    })

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already initialized' 
      })
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123456', 12)
    
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@ecommerce.com',
        passwordHash,
        name: 'Admin User',
        role: 'super_admin'
      }
    })

    // Create some sample products
    const sampleProducts = [
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        costPrice: 120.00,
        stock: 50,
        category: 'Electronics',
        status: 'active'
      },
      {
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with health tracking',
        price: 299.99,
        costPrice: 180.00,
        stock: 30,
        category: 'Electronics',
        status: 'active'
      },
      {
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

    // Create some sample sales data
    const products = await prisma.product.findMany()
    const salesData = []

    for (let i = 0; i < 20; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30))

      salesData.push({
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
      message: 'Database initialized successfully',
      admin: { email: admin.email, name: admin.name }
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