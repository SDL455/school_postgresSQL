import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/teachers - List all teachers
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const department = query.department as string || ''
  const status = query.status as string || ''
  const all = query.all === 'true'
  
  const where: any = {}
  
  if (search) {
    where.OR = [
      { teacherCode: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (department) {
    where.department = department
  }
  
  if (status) {
    where.status = status
  }
  
  if (all) {
    const teachers = await prisma.teacher.findMany({
      where,
      include: {
        homeroomClassrooms: {
          include: {
            gradeLevel: true,
          }
        },
        teachingAssignments: {
          include: {
            classroom: true,
            subject: true,
          }
        }
      },
      orderBy: { firstName: 'asc' },
    })
    
    return {
      success: true,
      data: teachers,
    }
  }
  
  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        homeroomClassrooms: {
          include: {
            gradeLevel: true,
          }
        },
        teachingAssignments: {
          include: {
            classroom: true,
            subject: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teacher.count({ where }),
  ])
  
  return {
    success: true,
    data: teachers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
})
