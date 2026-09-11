import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            farmerProfile: true,
            consumerProfile: true,
          },
        })

        if (!user) {
          throw new Error('No account found with this email')
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated')
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValidPassword) {
          throw new Error('Incorrect password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.preferredLanguage = (user as any).preferredLanguage
      }
      
      // Handle manual session updates (like language change)
      if (trigger === 'update' && session?.preferredLanguage) {
        token.preferredLanguage = session.preferredLanguage
      }

      // Always refresh role from DB to prevent role tampering
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true, preferredLanguage: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.preferredLanguage = dbUser.preferredLanguage
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.preferredLanguage = (token.preferredLanguage as string) || 'en'
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      preferredLanguage: string
    }
  }
  interface User {
    role: string
    preferredLanguage: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    preferredLanguage: string
  }
}
