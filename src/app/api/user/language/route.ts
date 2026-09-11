import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { language } = body

    if (!language || !['en', 'te', 'hi'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { preferredLanguage: language },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating language preference:', error)
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    )
  }
}
