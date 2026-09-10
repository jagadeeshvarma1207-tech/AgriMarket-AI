import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// POST /api/products/[id]/images — Add image to product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product || product.farmerId !== farmer?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { url, isPrimary, sortOrder, altText } = body

    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // If setting as primary, unset others
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      })
    }

    const image = await prisma.productImage.create({
      data: { productId: id, url, isPrimary: isPrimary || false, sortOrder: sortOrder || 0, altText: altText || null },
    })

    return NextResponse.json({ image }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add image' }, { status: 500 })
  }
}

// DELETE /api/products/[id]/images — Remove an image
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({ where: { userId: session.user.id } })
    const product = await prisma.product.findUnique({ where: { id } })

    if (!product || product.farmerId !== farmer?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { imageId } = await req.json()
    await prisma.productImage.delete({ where: { id: imageId } })

    return NextResponse.json({ message: 'Image removed' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove image' }, { status: 500 })
  }
}
