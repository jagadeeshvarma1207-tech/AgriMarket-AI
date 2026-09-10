import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ORDER_STATUSES } from '@/lib/validation'

// GET /api/orders — Get orders for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}
    if (status) where.status = status

    if (session.user.role === 'FARMER') {
      const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
      if (!farmer) return NextResponse.json({ orders: [] })
      where.farmerId = farmer.id
    } else {
      const consumer = await prisma.consumerProfile.findUnique({ where: { userId: session.user.id } })
      if (!consumer) return NextResponse.json({ orders: [] })
      where.consumerId = consumer.id
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: { isPrimary: 'desc' }, take: 1 },
                },
              },
            },
          },
          consumer: { include: { user: { select: { name: true } } } },
          farmer: { include: { user: { select: { name: true } } } },
          review: true,
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[Orders GET]', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders — Place a new order (consumer only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized. Consumers only.' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!consumer) return NextResponse.json({ error: 'Consumer profile not found' }, { status: 404 })

    const body = await req.json()
    const { items, deliveryType, deliveryAddress, consumerNote } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 })
    }

    // Validate all items and fetch product info
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { farmer: true },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 })
    }

    // Check all products belong to same farmer (one order per farmer)
    const farmerIds = [...new Set(products.map((p) => p.farmerId))]
    if (farmerIds.length > 1) {
      return NextResponse.json(
        { error: 'Please place separate orders for products from different farmers' },
        { status: 400 }
      )
    }

    const farmerId = farmerIds[0]

    // Calculate totals
    let totalPrice = 0
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!
      const qty = parseFloat(item.quantity)
      if (qty <= 0 || qty > product.quantity) {
        throw new Error(`Invalid quantity for ${product.name}`)
      }
      const itemTotal = product.price * qty
      totalPrice += itemTotal
      return {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unit: product.unit,
        unitPrice: product.price,
        totalPrice: itemTotal,
      }
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        consumerId: consumer.id,
        farmerId,
        totalPrice,
        deliveryType: deliveryType || 'PICKUP',
        deliveryAddress: deliveryAddress || null,
        consumerNote: consumerNote || null,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        farmer: { include: { user: { select: { name: true } } } },
      },
    })

    // Update product order counts
    await Promise.all(
      products.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { orderCount: { increment: 1 } },
        })
      )
    ).catch(() => {})

    return NextResponse.json({ order }, { status: 201 })
  } catch (err: any) {
    console.error('[Orders POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 })
  }
}
