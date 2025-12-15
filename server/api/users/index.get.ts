import { prisma } from '../../utils/prisma'
import { requireRoles, hashPassword } from '../../utils/auth'
import { validateBody, createUserSchema, updateUserSchema } from '../../utils/validation'

// GET /api/users - List all users
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const role = query.role as string || ''
  const status = query.status as string || ''
  
  const where: any = {}
  
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (role) {
    where.role = role
  }
  
  if (status) {
    where.status = status
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])
  
  return {
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
})
