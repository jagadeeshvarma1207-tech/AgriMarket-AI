import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/farmer/products — Get all products for current farmer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    if (!farmer) return NextResponse.json({ products: [] })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const products = await prisma.product.findMany({
      where: {
        farmerId: farmer.id,
        ...(status && { status }),
      },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        aiResults: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (err) {
    console.error('[Farmer Products]', err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
