import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { validateReview } from '@/lib/validation'

// POST /api/reviews — Submit a review (consumer only, after completed order)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!consumer) return NextResponse.json({ error: 'Consumer profile not found' }, { status: 404 })

    const body = await req.json()
    const { orderId, stars, title, body: reviewBody, productId } = body

    const validation = validateReview({ stars, body: reviewBody })
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // Verify order exists, belongs to consumer, and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.consumerId !== consumer.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed orders' }, { status: 400 })
    }
    if (order.review) {
      return NextResponse.json({ error: 'Review already submitted for this order' }, { status: 409 })
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        orderId,
        consumerId: consumer.id,
        farmerId: order.farmerId,
        productId: productId || null,
        stars: parseInt(stars),
        title: title?.trim() || null,
        body: reviewBody?.trim() || null,
      },
    })

    // Update farmer average rating
    const farmerReviews = await prisma.review.aggregate({
      where: { farmerId: order.farmerId },
      _avg: { stars: true },
      _count: { stars: true },
    })
    await prisma.farmerProfile.update({
      where: { id: order.farmerId },
      data: {
        totalRating: farmerReviews._avg.stars || 0,
        reviewCount: farmerReviews._count.stars,
      },
    })

    // Update product rating if productId provided
    if (productId) {
      const productReviews = await prisma.review.aggregate({
        where: { productId },
        _avg: { stars: true },
        _count: { stars: true },
      })
      await prisma.product.update({
        where: { id: productId },
        data: {
          totalRating: productReviews._avg.stars || 0,
          reviewCount: productReviews._count.stars,
        },
      }).catch(() => {})
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (err) {
    console.error('[Reviews POST]', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/reviews?farmerId=...&productId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const farmerId = searchParams.get('farmerId')
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { isPublic: true }
    if (farmerId) where.farmerId = farmerId
    if (productId) where.productId = productId

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          consumer: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({ reviews, total })
  } catch (err) {
    console.error('[Reviews GET]', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
