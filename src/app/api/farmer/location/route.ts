import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { approximateCoordinate } from '@/lib/utils'

// GET /api/farmer/location — Get current farmer's location
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    if (!farmer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const location = await prisma.location.findUnique({ where: { farmerId: farmer.id } })
    return NextResponse.json({ location })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
  }
}

// POST /api/farmer/location — Save/update farmer location
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    if (!farmer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const {
      latitude,
      longitude,
      city,
      state,
      country,
      pincode,
      displayAddress,
      sellingLocation,
    } = body

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }

    // Create approximate coordinates for public display (privacy protection)
    const approxLat = approximateCoordinate(lat, 0.5) // ~500m offset
    const approxLng = approximateCoordinate(lng, 0.5)

    const location = await prisma.location.upsert({
      where: { farmerId: farmer.id },
      update: {
        latitude: lat,
        longitude: lng,
        approxLatitude: approxLat,
        approxLongitude: approxLng,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        pincode: pincode?.trim() || null,
        displayAddress: displayAddress?.trim() || null,
        sellingLocation: sellingLocation?.trim() || null,
      },
      create: {
        farmerId: farmer.id,
        latitude: lat,
        longitude: lng,
        approxLatitude: approxLat,
        approxLongitude: approxLng,
        city: city?.trim() || null,
        state: state?.trim() || null,
        country: country?.trim() || null,
        pincode: pincode?.trim() || null,
        displayAddress: displayAddress?.trim() || null,
        sellingLocation: sellingLocation?.trim() || null,
      },
    })

    return NextResponse.json({ location })
  } catch (err) {
    console.error('[Location POST]', err)
    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 })
  }
}
