import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getNextOrderStatuses } from '@/lib/utils'

// GET /api/orders/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        consumer: { include: { user: { select: { name: true } } } },
        farmer: { include: { user: { select: { name: true } }, location: { select: { city: true, state: true } } } },
        review: true,
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Verify ownership
    const [farmer, consumer] = await Promise.all([
      session.user.role === 'FARMER'
        ? prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
        : null,
      session.user.role === 'CONSUMER'
        ? prisma.consumerProfile.findUnique({ where: { userId: session.user.id } })
        : null,
    ])

    const isFarmerOwner = farmer && order.farmerId === farmer.id
    const isConsumerOwner = consumer && order.consumerId === consumer.id

    if (!isFarmerOwner && !isConsumerOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('[Order GET]', err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — Update order status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { status, farmerNote, cancelReason } = body

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Verify ownership
    const [farmer, consumer] = await Promise.all([
      prisma.farmerProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.consumerProfile.findUnique({ where: { userId: session.user.id } }),
    ])

    const isFarmerOwner = farmer && order.farmerId === farmer.id
    const isConsumerOwner = consumer && order.consumerId === consumer.id

    if (!isFarmerOwner && !isConsumerOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check valid transition
    const validNextStatuses = getNextOrderStatuses(order.status, session.user.role)
    if (!validNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${order.status} to ${status}` },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(farmerNote !== undefined && { farmerNote }),
        ...(cancelReason && { cancelReason }),
      },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        consumer: { include: { user: { select: { name: true } } } },
        farmer: { include: { user: { select: { name: true } } } },
        review: true,
      },
    })

    return NextResponse.json({ order: updated })
  } catch (err) {
    console.error('[Order PATCH]', err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
