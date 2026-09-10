import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/consumer/favorites
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({ where: { userId: session.user.id } })
    if (!consumer) return NextResponse.json({ favorites: [] })

    const favorites = await prisma.favorite.findMany({
      where: { consumerId: consumer.id },
      include: {
        product: {
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
            farmer: {
              include: {
                user: { select: { name: true } },
                location: { select: { city: true, state: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ favorites })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

// POST /api/consumer/favorites — Toggle favorite
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({ where: { userId: session.user.id } })
    if (!consumer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })

    const existing = await prisma.favorite.findUnique({
      where: { consumerId_productId: { consumerId: consumer.id, productId } },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      await prisma.favorite.create({ data: { consumerId: consumer.id, productId } })
      return NextResponse.json({ favorited: true })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update favorites' }, { status: 500 })
  }
}
