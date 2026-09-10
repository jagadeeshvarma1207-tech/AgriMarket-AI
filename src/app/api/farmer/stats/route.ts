import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/farmer/stats — Dashboard stats for farmer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!farmer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenueResult,
      recentOrders,
      unreadMessages,
    ] = await Promise.all([
      prisma.product.count({ where: { farmerId: farmer.id } }),
      prisma.product.count({ where: { farmerId: farmer.id, status: 'ACTIVE' } }),
      prisma.order.count({ where: { farmerId: farmer.id } }),
      prisma.order.count({ where: { farmerId: farmer.id, status: 'PENDING' } }),
      prisma.order.count({ where: { farmerId: farmer.id, status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { farmerId: farmer.id, status: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      prisma.order.findMany({
        where: { farmerId: farmer.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: { take: 1, include: { product: { include: { images: { take: 1 } } } } },
          consumer: { include: { user: { select: { name: true } } } },
        },
      }),
      prisma.message.count({ where: { farmerId: farmer.id, isRead: false } }),
    ])

    return NextResponse.json({
      stats: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: totalRevenueResult._sum.totalPrice || 0,
        averageRating: farmer.totalRating,
        reviewCount: farmer.reviewCount,
        unreadMessages,
      },
      recentOrders,
    })
  } catch (err) {
    console.error('[Farmer Stats]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
