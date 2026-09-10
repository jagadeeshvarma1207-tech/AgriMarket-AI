import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/consumer/profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consumer = await prisma.consumerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
      },
    })

    if (!consumer) return NextResponse.json({ error: 'Consumer profile not found' }, { status: 404 })
    return NextResponse.json({ consumer })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH /api/consumer/profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'CONSUMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, avatarUrl, deliveryAddress } = body

    if (name) {
      await prisma.user.update({ where: { id: session.user.id }, data: { name: name.trim() } })
    }

    const consumer = await prisma.consumerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(deliveryAddress !== undefined && { deliveryAddress: deliveryAddress?.trim() || null }),
      },
      include: { user: { select: { name: true, email: true } } },
    })

    return NextResponse.json({ consumer })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
