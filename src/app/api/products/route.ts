import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { validateProduct } from '@/lib/validation'

// GET /api/products — List products (public, with filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const grade = searchParams.get('grade')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const farmerId = searchParams.get('farmerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {
      status: 'ACTIVE',
      ...(category && { category }),
      ...(farmerId && { farmerId }),
      ...(grade && { qualityGrade: grade }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { category: { contains: search } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      }),
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'price':
          return { price: order === 'asc' ? 'asc' : 'desc' }
        case 'rating':
          return { totalRating: 'desc' }
        case 'popular':
          return { orderCount: 'desc' }
        default:
          return { createdAt: 'desc' }
      }
    })()

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          farmer: {
            include: {
              user: { select: { name: true } },
              location: {
                select: {
                  city: true,
                  state: true,
                  displayAddress: true,
                  approxLatitude: true,
                  approxLongitude: true,
                },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products: products.map(sanitizeProduct),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[Products GET]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products — Create product (farmer only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, category, description, price, quantity, unit, harvestDate, expiryDate, tags, status } = body

    const validation = validateProduct({ name, category, price, quantity, unit })
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        farmerId: farmer.id,
        name: name.trim(),
        category,
        description: description?.trim() || null,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        unit,
        status: status || 'ACTIVE',
        ...(harvestDate && { harvestDate: new Date(harvestDate) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(tags && { tags: JSON.stringify(tags) }),
      },
      include: {
        images: true,
        farmer: {
          include: { user: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[Products POST]', err)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

function sanitizeProduct(product: any) {
  return {
    ...product,
    farmer: {
      ...product.farmer,
      user: product.farmer.user,
      // Strip sensitive farmer info
      phone: undefined,
    },
  }
}
