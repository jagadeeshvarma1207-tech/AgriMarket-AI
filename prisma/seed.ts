import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding AgriMarket AI database...')

  // Clean up existing data in correct order
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.message.deleteMany()
  await prisma.aIQualityResult.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.location.deleteMany()
  await prisma.consumerProfile.deleteMany()
  await prisma.farmerProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('  ✓ Cleared existing data')

  const password = await bcrypt.hash('demo1234', 12)

  // ─── FARMERS ───────────────────────────────────────────────────────────────
  const farmer1User = await prisma.user.create({
    data: { name: 'Rajan Kumar', email: 'farmer@demo.com', passwordHash: password, role: 'FARMER' }
  })

  const farmer2User = await prisma.user.create({
    data: { name: 'Priya Sharma', email: 'priya.farmer@demo.com', passwordHash: password, role: 'FARMER' }
  })

  const farmer3User = await prisma.user.create({
    data: { name: 'Mohan Reddy', email: 'mohan.farmer@demo.com', passwordHash: password, role: 'FARMER' }
  })

  // ─── FARMER PROFILES ───────────────────────────────────────────────────────
  const farmer1 = await prisma.farmerProfile.create({
    data: {
      userId: farmer1User.id,
      farmName: 'Green Valley Organics',
      bio: 'Third-generation farmer from Karnataka. We specialize in organic vegetables and fruits grown without pesticides. Our farm has been certified organic since 2019.',
      phone: '+91 98765 43210',
      totalRating: 4.7,
      reviewCount: 12,
    }
  })

  const farmer2 = await prisma.farmerProfile.create({
    data: {
      userId: farmer2User.id,
      farmName: 'Priya\'s Fresh Harvest',
      bio: 'Small-scale farmer specializing in seasonal vegetables and herbs. I believe in sustainable farming and bringing the freshest produce to your table daily.',
      phone: '+91 87654 32109',
      totalRating: 4.5,
      reviewCount: 8,
    }
  })

  const farmer3 = await prisma.farmerProfile.create({
    data: {
      userId: farmer3User.id,
      farmName: 'Reddy Farms',
      bio: 'Large-scale fruit farmer from Andhra Pradesh. We grow mangoes, bananas, and citrus fruits using traditional methods combined with modern quality practices.',
      phone: '+91 76543 21098',
      totalRating: 4.2,
      reviewCount: 15,
    }
  })

  // ─── FARMER LOCATIONS ──────────────────────────────────────────────────────
  await prisma.location.create({
    data: {
      farmerId: farmer1.id,
      latitude: 12.9716,
      longitude: 77.5946,
      approxLatitude: 12.9752,
      approxLongitude: 77.5998,
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      displayAddress: 'Near Lalbagh Botanical Garden, Bangalore',
      sellingLocation: 'Lalbagh Farmers Market, Stall 12, Every Saturday 6-11 AM',
    }
  })

  await prisma.location.create({
    data: {
      farmerId: farmer2.id,
      latitude: 13.0827,
      longitude: 80.2707,
      approxLatitude: 13.0866,
      approxLongitude: 80.2734,
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pincode: '600001',
      displayAddress: 'Near Koyambedu Market, Chennai',
      sellingLocation: 'Koyambedu Wholesale Vegetable Market',
    }
  })

  await prisma.location.create({
    data: {
      farmerId: farmer3.id,
      latitude: 17.3850,
      longitude: 78.4867,
      approxLatitude: 17.3892,
      approxLongitude: 78.4912,
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500001',
      displayAddress: 'Secunderabad, Hyderabad',
      sellingLocation: 'APMC Fruit Market, Hyderabad',
    }
  })

  console.log('  ✓ Created farmer profiles and locations')

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────
  const products = [
    {
      farmerId: farmer1.id,
      name: 'Fresh Organic Tomatoes',
      category: 'Vegetables',
      description: 'Vine-ripened organic tomatoes grown without pesticides. Perfect for salads, sauces, and curries. Harvested fresh daily from our certified organic fields.',
      price: 45,
      quantity: 50,
      unit: 'kg',
      qualityGrade: 'A',
      aiConfidence: 87,
      status: 'ACTIVE',
      totalRating: 4.8,
      reviewCount: 6,
      orderCount: 23,
      tags: JSON.stringify(['organic', 'fresh', 'vine-ripened']),
      images: [
        { url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer1.id,
      name: 'Baby Spinach',
      category: 'Vegetables',
      description: 'Tender baby spinach leaves, washed and ready to eat. Rich in iron and vitamins. Grown in controlled environment for consistent quality.',
      price: 60,
      quantity: 20,
      unit: 'kg',
      qualityGrade: 'A',
      aiConfidence: 91,
      status: 'ACTIVE',
      totalRating: 4.6,
      reviewCount: 4,
      orderCount: 15,
      images: [
        { url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer1.id,
      name: 'Organic Carrots',
      category: 'Vegetables',
      description: 'Sweet and crunchy organic carrots. Naturally grown in mineral-rich red soil. Great for juicing, cooking, or eating raw.',
      price: 35,
      quantity: 100,
      unit: 'kg',
      qualityGrade: 'B',
      aiConfidence: 79,
      status: 'ACTIVE',
      totalRating: 4.3,
      reviewCount: 3,
      orderCount: 12,
      images: [
        { url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer2.id,
      name: 'Fresh Green Chillies',
      category: 'Vegetables',
      description: 'Medium-hot green chillies from Tamil Nadu. Used in all Indian cuisines. Freshly picked and delivered within 24 hours of harvest.',
      price: 80,
      quantity: 30,
      unit: 'kg',
      qualityGrade: 'A',
      aiConfidence: 84,
      status: 'ACTIVE',
      totalRating: 4.5,
      reviewCount: 5,
      orderCount: 18,
      images: [
        { url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer2.id,
      name: 'Drumsticks (Murungakkai)',
      category: 'Vegetables',
      description: 'Fresh drumsticks packed with nutrition. Excellent for sambar, dal, and South Indian curries. Harvested from mature moringa trees.',
      price: 40,
      quantity: 40,
      unit: 'kg',
      qualityGrade: 'B',
      aiConfidence: 76,
      status: 'ACTIVE',
      totalRating: 4.4,
      reviewCount: 3,
      orderCount: 9,
      images: [
        { url: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer2.id,
      name: 'Fresh Curry Leaves',
      category: 'Herbs & Spices',
      description: 'Aromatic fresh curry leaves harvested daily. Essential for South Indian cooking. Rich in antioxidants and with a distinctly fresh aroma.',
      price: 20,
      quantity: 10,
      unit: 'kg',
      qualityGrade: 'A',
      aiConfidence: 93,
      status: 'ACTIVE',
      totalRating: 4.9,
      reviewCount: 7,
      orderCount: 31,
      images: [
        { url: 'https://images.unsplash.com/photo-1600755896765-4454bba5e70e?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer3.id,
      name: 'Alphonso Mangoes',
      category: 'Fruits',
      description: 'Premium Alphonso mangoes from Ratnagiri. Known as the "King of Mangoes" for their rich, creamy texture and exceptional sweetness. Limited seasonal availability.',
      price: 350,
      quantity: 200,
      unit: 'dozen',
      qualityGrade: 'A',
      aiConfidence: 95,
      status: 'ACTIVE',
      totalRating: 5.0,
      reviewCount: 10,
      orderCount: 47,
      images: [
        { url: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer3.id,
      name: 'Bananas (Nendran)',
      category: 'Fruits',
      description: 'Kerala\'s famous Nendran bananas. Larger than regular bananas with a distinct flavor. Excellent for cooking (plantain chips, banana blossom curry) or eating ripe.',
      price: 60,
      quantity: 500,
      unit: 'dozen',
      qualityGrade: 'B',
      aiConfidence: 82,
      status: 'ACTIVE',
      totalRating: 4.4,
      reviewCount: 6,
      orderCount: 28,
      images: [
        { url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer3.id,
      name: 'Mosambi (Sweet Lime)',
      category: 'Fruits',
      description: 'Juicy sweet limes from Vidarbha region. Perfect for fresh juice. High in Vitamin C and refreshing in summer.',
      price: 80,
      quantity: 300,
      unit: 'dozen',
      qualityGrade: 'A',
      aiConfidence: 88,
      status: 'ACTIVE',
      totalRating: 4.6,
      reviewCount: 4,
      orderCount: 19,
      images: [
        { url: 'https://images.unsplash.com/photo-1590502160462-58b41354f588?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
    {
      farmerId: farmer1.id,
      name: 'Toor Dal (Pigeon Peas)',
      category: 'Pulses & Legumes',
      description: 'Fresh toor dal from our farm. Naturally sun-dried and processed without chemicals. Staple ingredient for dal, sambar, and rasam.',
      price: 120,
      quantity: 75,
      unit: 'kg',
      qualityGrade: 'B',
      aiConfidence: 73,
      status: 'ACTIVE',
      totalRating: 4.2,
      reviewCount: 3,
      orderCount: 11,
      images: [
        { url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80', isPrimary: true, sortOrder: 0 }
      ]
    },
  ]

  for (const productData of products) {
    const { images, ...pData } = productData
    const product = await prisma.product.create({
      data: {
        ...pData,
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    })

    // Create images
    for (const img of images) {
      await prisma.productImage.create({
        data: { productId: product.id, ...img }
      })
    }

    // Create AI result for graded products
    if (pData.qualityGrade !== 'UNGRADED') {
      await prisma.aIQualityResult.create({
        data: {
          productId: product.id,
          imageUrl: images[0].url,
          grade: pData.qualityGrade,
          confidence: pData.aiConfidence || 75,
          detectedFeatures: JSON.stringify(['Color assessment completed', 'Shape analysis done', 'Surface quality checked']),
          recommendations: JSON.stringify(['AI grading complete — placeholder model']),
          modelVersion: 'placeholder-v0.1',
          isPlaceholder: true,
          produceType: pData.category,
        }
      })
    }
  }

  console.log('  ✓ Created', products.length, 'products with images and AI results')

  // ─── CONSUMER ──────────────────────────────────────────────────────────────
  const consumerUser = await prisma.user.create({
    data: { name: 'Amit Patel', email: 'consumer@demo.com', passwordHash: password, role: 'CONSUMER' }
  })

  const consumer = await prisma.consumerProfile.create({
    data: { userId: consumerUser.id }
  })

  console.log('  ✓ Created consumer account')
  console.log('\n✅ Database seeded successfully!')
  console.log('\n📧 Demo Accounts:')
  console.log('   Farmer: farmer@demo.com / demo1234')
  console.log('   Consumer: consumer@demo.com / demo1234')
  console.log('   Farmer 2: priya.farmer@demo.com / demo1234')
  console.log('   Farmer 3: mohan.farmer@demo.com / demo1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
