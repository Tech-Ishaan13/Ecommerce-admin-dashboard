#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@ecommerce.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123456', 12);
    
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@ecommerce.com',
        passwordHash,
        name: 'Admin User',
        role: 'super_admin'
      }
    });

    console.log('✅ Created admin user:', admin.email);

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
    ];

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product });
    }

    console.log('✅ Created sample products');

    // Create some sample sales data
    const products = await prisma.product.findMany();
    const salesData = [];

    for (let i = 0; i < 20; i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));

      salesData.push({
        productId: randomProduct.id,
        quantity,
        unitPrice: randomProduct.price,
        totalAmount: randomProduct.price * quantity,
        saleDate
      });
    }

    await prisma.salesData.createMany({ data: salesData });
    console.log('✅ Created sample sales data');

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { initializeDatabase };