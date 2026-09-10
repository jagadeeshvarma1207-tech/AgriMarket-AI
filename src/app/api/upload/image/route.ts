import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { saveUploadedFile, validateFile } from '@/lib/upload'

// POST /api/upload/image — Upload product or profile image
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const subDir = (formData.get('subDir') as string) || 'products'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validationError = validateFile(file.size, file.type, file.name)
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    // Convert to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Save file
    const result = await saveUploadedFile(buffer, file.type, subDir)

    return NextResponse.json({
      url: result.url,
      filename: result.filename,
      size: result.size,
    })
  } catch (err) {
    console.error('[Upload]', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

