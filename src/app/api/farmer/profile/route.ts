import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/farmer/profile — Get current farmer's profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        location: true,
        products: {
          where: { status: 'ACTIVE' },
          include: { images: { orderBy: { isPrimary: 'desc' }, take: 1 } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 })
    }

    return NextResponse.json({ farmer })
  } catch (err) {
    console.error('[Farmer Profile GET]', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PATCH /api/farmer/profile — Update farmer profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { farmName, bio, phone, avatarUrl, coverUrl, name } = body

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() },
      })
    }

    const farmer = await prisma.farmerProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(farmName !== undefined && { farmName: farmName.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
      },
      include: {
        user: { select: { name: true, email: true } },
        location: true,
      },
    })

    return NextResponse.json({ farmer })
  } catch (err) {
    console.error('[Farmer Profile PATCH]', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
