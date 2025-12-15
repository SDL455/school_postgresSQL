import { prisma } from '../../utils/prisma'
import { requireAuth, canManageStudents } from '../../utils/auth'

// GET /api/students - List all students
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string || ''
  const classroomId = query.classroomId ? parseInt(query.classroomId as string) : null
  const gradeLevelId = query.gradeLevelId ? parseInt(query.gradeLevelId as string) : null
  const gender = query.gender as string || ''
  const status = query.status as string || ''
  
  const where: any = {}
  
  if (search) {
    where.OR = [
      { studentCode: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (classroomId) {
    where.classroomId = classroomId
  }
  
  if (gradeLevelId) {
    where.classroom = {
      gradeLevelId
    }
  }
  
  if (gender) {
    where.gender = gender
  }
  
  if (status) {
    where.status = status
  }
  
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        classroom: {
          include: {
            gradeLevel: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ])
  
  return {
    success: true,
    data: students,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
})
