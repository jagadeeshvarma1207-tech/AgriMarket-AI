import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/farmer/messages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    if (!farmer) return NextResponse.json({ messages: [] })

    const messages = await prisma.message.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' },
    })

    // Mark all as read
    await prisma.message.updateMany({
      where: { farmerId: farmer.id, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ messages })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/farmer/messages — Send message to farmer (any authenticated user)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { farmerId, senderName, senderEmail, senderPhone, subject, messageBody } = body

    if (!farmerId || !senderName || !messageBody) {
      return NextResponse.json(
        { error: 'Farmer ID, sender name and message are required' },
        { status: 400 }
      )
    }

    if (messageBody.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { id: farmerId } })
    if (!farmer) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })

    const message = await prisma.message.create({
      data: {
        farmerId,
        senderName: senderName.trim(),
        senderEmail: senderEmail?.trim() || null,
        senderPhone: senderPhone?.trim() || null,
        subject: subject?.trim() || null,
        body: messageBody.trim(),
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('[Messages POST]', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
