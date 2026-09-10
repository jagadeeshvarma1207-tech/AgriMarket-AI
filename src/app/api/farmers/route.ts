import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'

// GET /api/farmers — List farmers with optional location filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const radius = parseFloat(searchParams.get('radius') || '50') // km
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const farmers = await prisma.farmerProfile.findMany({
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
        products: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
      orderBy: { totalRating: 'desc' },
    })

    let result = farmers.map((f) => ({
      id: f.id,
      farmName: f.farmName,
      userName: f.user.name,
      avatarUrl: f.avatarUrl,
      isVerified: f.isVerified,
      totalRating: f.totalRating,
      reviewCount: f.reviewCount,
      productCount: f.products.length,
      location: f.location,
      distance:
        lat && lng && f.location?.approxLatitude && f.location?.approxLongitude
          ? calculateDistance(lat, lng, f.location.approxLatitude, f.location.approxLongitude)
          : null,
    }))

    // Filter by distance if coordinates provided
    if (lat && lng) {
      result = result.filter((f) => f.distance === null || f.distance <= radius)
      result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    const total = result.length
    const paginated = result.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ farmers: paginated, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[Farmers GET]', err)
    return NextResponse.json({ error: 'Failed to fetch farmers' }, { status: 500 })
  }
}
