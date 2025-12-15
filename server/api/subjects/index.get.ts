import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

// GET /api/subjects - List all subjects
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
      { subjectCode: { contains: search, mode: 'insensitive' } },
      { subjectName: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (department) {
    where.department = department
  }
  
  if (status) {
    where.status = status
  }
  
  if (all) {
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        subjectGradeLevels: {
          include: {
            gradeLevel: true,
          }
        }
      },
      orderBy: { subjectName: 'asc' },
    })
    
    return {
      success: true,
      data: subjects,
    }
  }
  
  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      include: {
        subjectGradeLevels: {
          include: {
            gradeLevel: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.subject.count({ where }),
  ])
  
  return {
    success: true,
    data: subjects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
})
