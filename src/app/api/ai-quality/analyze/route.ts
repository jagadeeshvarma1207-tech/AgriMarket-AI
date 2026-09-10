import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { saveUploadedFile, validateFile } from '@/lib/upload'
import { analyzeProduceQuality } from '@/lib/ai-service'
import path from 'path'

// POST /api/ai-quality/analyze — Run AI quality check on uploaded image
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized. Farmers only.' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!farmer) {
      return NextResponse.json({ error: 'Farmer profile not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File
    const produceHint = formData.get('produceHint') as string | null
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Validate file
    const validationError = validateFile(file.size, file.type, file.name)
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    // Save uploaded image
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await saveUploadedFile(buffer, file.type, 'ai-quality')
    const imagePath = path.join(process.cwd(), 'public', uploadResult.url)

    // Run AI analysis
    const aiResult = await analyzeProduceQuality({
      imagePath,
      produceHint: produceHint || undefined,
    })

    // Save result to database
    const savedResult = await prisma.aIQualityResult.create({
      data: {
        farmerId: farmer.id,
        productId: productId || null,
        imageUrl: uploadResult.url,
        grade: aiResult.grade,
        confidence: aiResult.confidence,
        detectedFeatures: JSON.stringify(aiResult.detectedFeatures),
        recommendations: JSON.stringify(aiResult.recommendations),
        rawResult: JSON.stringify(aiResult),
        modelVersion: aiResult.modelVersion,
        isPlaceholder: aiResult.isPlaceholder,
        produceType: aiResult.produceType,
      },
    })

    // If productId provided, update product quality grade
    if (productId) {
      await prisma.product.update({
        where: { id: productId, farmerId: farmer.id },
        data: {
          qualityGrade: aiResult.grade,
          aiConfidence: aiResult.confidence,
        },
      }).catch(() => {}) // Non-critical
    }

    return NextResponse.json({
      result: {
        id: savedResult.id,
        imageUrl: uploadResult.url,
        grade: aiResult.grade,
        confidence: aiResult.confidence,
        detectedFeatures: aiResult.detectedFeatures,
        recommendations: aiResult.recommendations,
        modelVersion: aiResult.modelVersion,
        isPlaceholder: aiResult.isPlaceholder,
        produceType: aiResult.produceType,
        analysisTimestamp: aiResult.analysisTimestamp,
      },
    })
  } catch (err) {
    console.error('[AI Quality]', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}

// GET /api/ai-quality/analyze — Get analysis history for current farmer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!farmer) return NextResponse.json({ results: [] })

    const results = await prisma.aIQualityResult.findMany({
      where: { farmerId: farmer.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      results: results.map((r) => ({
        ...r,
        detectedFeatures: r.detectedFeatures ? JSON.parse(r.detectedFeatures) : [],
        recommendations: r.recommendations ? JSON.parse(r.recommendations) : [],
      })),
    })
  } catch (err) {
    console.error('[AI Quality GET]', err)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
