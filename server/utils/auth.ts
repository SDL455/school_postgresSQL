import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { prisma } from './prisma'

const SALT_ROUNDS = 10

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Get JWT secret from runtime config
function getJwtSecret(): string {
  const config = useRuntimeConfig()
  return config.jwtSecret || 'default-secret-change-in-production'
}

// Generate JWT token
export function generateToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: number; role: string }
  } catch {
    return null
  }
}

// Get current user from request
export async function getCurrentUser(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  })
  
  return user
}

// Require authentication middleware
export async function requireAuth(event: H3Event) {
  const user = await getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ'
    })
  }
  
  if (user.status !== 'ACTIVE') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'ບັນຊີຂອງທ່ານຖືກລະງັບ'
    })
  }
  
  return user
}

// Require specific roles
export async function requireRoles(event: H3Event, allowedRoles: string[]) {
  const user = await requireAuth(event)
  
  if (!allowedRoles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງ'
    })
  }
  
  return user
}

// Role check helpers
export function isAdmin(role: string): boolean {
  return role === 'ADMIN'
}

export function isManager(role: string): boolean {
  return role === 'MANAGER'
}

export function isRegistrar(role: string): boolean {
  return role === 'REGISTRAR'
}

export function isTeacher(role: string): boolean {
  return role === 'TEACHER'
}

// Can access administrative features
export function canAccessAdmin(role: string): boolean {
  return ['ADMIN', 'MANAGER'].includes(role)
}

// Can manage students
export function canManageStudents(role: string): boolean {
  return ['ADMIN', 'MANAGER', 'REGISTRAR'].includes(role)
}

// Can enter grades
export function canEnterGrades(role: string): boolean {
  return ['ADMIN', 'MANAGER', 'TEACHER'].includes(role)
}
