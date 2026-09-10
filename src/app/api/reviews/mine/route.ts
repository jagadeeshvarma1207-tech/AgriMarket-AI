import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/reviews/mine — Get current consumer's reviews
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!consumer) return NextResponse.json({ reviews: [] })

    const reviews = await prisma.review.findMany({
      where: { consumerId: consumer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        farmer: { include: { user: { select: { name: true } } } },
        product: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ reviews })
  } catch (err) {
    console.error('[Reviews Mine]', err)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
