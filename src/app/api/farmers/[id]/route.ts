import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/farmers/[id] — Public farmer profile
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, createdAt: true } },
        location: {
          select: {
            city: true,
            state: true,
            displayAddress: true,
            approxLatitude: true,
            approxLongitude: true,
            sellingLocation: true,
          },
        },
        products: {
          where: { status: 'ACTIVE' },
          include: {
            images: { orderBy: { isPrimary: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
        reviews: {
          where: { isPublic: true },
          include: {
            consumer: { include: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 })
    }

    // Strip private info
    return NextResponse.json({
      farmer: {
        id: farmer.id,
        farmName: farmer.farmName,
        bio: farmer.bio,
        avatarUrl: farmer.avatarUrl,
        coverUrl: farmer.coverUrl,
        isVerified: farmer.isVerified,
        totalRating: farmer.totalRating,
        reviewCount: farmer.reviewCount,
        createdAt: farmer.user.createdAt,
        userName: farmer.user.name,
        location: farmer.location,
        products: farmer.products,
        reviews: farmer.reviews,
        // NOTE: phone NOT exposed in public farmer profile
      },
    })
  } catch (err) {
    console.error('[Farmer Public GET]', err)
    return NextResponse.json({ error: 'Failed to fetch farmer' }, { status: 500 })
  }
}
