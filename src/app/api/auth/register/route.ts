import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { validateRegistration } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    // Validate input
    const validation = validateRegistration({ name, email, password, role })
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { errors: { email: 'An account with this email already exists' } },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        ...(role === 'FARMER'
          ? {
              farmerProfile: {
                create: {
                  farmName: `${name.trim()}'s Farm`,
                },
              },
            }
          : {
              consumerProfile: {
                create: {},
              },
            }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    )
  } catch (err) {
    console.error('[Register API]', err)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
