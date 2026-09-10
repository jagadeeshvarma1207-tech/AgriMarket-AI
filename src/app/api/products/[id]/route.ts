import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { validateProduct } from '@/lib/validation'
import { deleteUploadedFile } from '@/lib/upload'

// GET /api/products/[id] — Get single product detail
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        farmer: {
          include: {
            user: { select: { name: true, email: true } },
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
          },
        },
        reviews: {
          where: { isPublic: true },
          include: {
            consumer: {
              include: { user: { select: { name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        aiResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {}) // Non-critical

    return NextResponse.json({
      product: {
        ...product,
        farmer: {
          ...product.farmer,
          phone: undefined, // Never expose phone in product detail
        },
      },
    })
  } catch (err) {
    console.error('[Product GET]', err)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PATCH /api/products/[id] — Update product (owner farmer only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.farmerId !== farmer?.id) {
      return NextResponse.json({ error: 'Forbidden — not your product' }, { status: 403 })
    }

    const body = await req.json()
    const { name, category, description, price, quantity, unit, harvestDate, expiryDate, tags, status } = body

    if (name || category || price || quantity || unit) {
      const validation = validateProduct({
        name: name || product.name,
        category: category || product.category,
        price: price !== undefined ? price : product.price,
        quantity: quantity !== undefined ? quantity : product.quantity,
        unit: unit || product.unit,
      })
      if (!validation.valid) {
        return NextResponse.json({ errors: validation.errors }, { status: 400 })
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(category && { category }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(status && { status }),
        ...(harvestDate !== undefined && { harvestDate: harvestDate ? new Date(harvestDate) : null }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
      },
      include: { images: true },
    })

    return NextResponse.json({ product: updated })
  } catch (err) {
    console.error('[Product PATCH]', err)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] — Delete product (owner farmer only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.farmerId !== farmer?.id) {
      return NextResponse.json({ error: 'Forbidden — not your product' }, { status: 403 })
    }

    // Check if product has active orders
    const activeOrders = await prisma.orderItem.count({
      where: {
        productId: id,
        order: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      },
    })
    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with active orders' },
        { status: 400 }
      )
    }

    // Delete images from filesystem
    product.images.forEach((img) => deleteUploadedFile(img.url))

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (err) {
    console.error('[Product DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
