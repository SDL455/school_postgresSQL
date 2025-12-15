import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

// GET /api/classrooms - List all classrooms
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const gradeLevelId = query.gradeLevelId ? parseInt(query.gradeLevelId as string) : null
  const academicYearId = query.academicYearId ? parseInt(query.academicYearId as string) : null
  const all = query.all === 'true'
  
  const where: any = {}
  
  if (gradeLevelId) {
    where.gradeLevelId = gradeLevelId
  }
  
  if (academicYearId) {
    where.academicYearId = academicYearId
  }
  
  const include = {
    gradeLevel: true,
    academicYear: true,
    homeroomTeacher: true,
    _count: {
      select: { students: true }
    }
  }
  
  if (all) {
    const classrooms = await prisma.classroom.findMany({
      where,
      include,
      orderBy: [
        { gradeLevel: { levelOrder: 'asc' } },
        { section: 'asc' },
      ],
    })
    
    return {
      success: true,
      data: classrooms,
    }
  }
  
  const [classrooms, total] = await Promise.all([
    prisma.classroom.findMany({
      where,
      include,
      orderBy: [
        { gradeLevel: { levelOrder: 'asc' } },
        { section: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.classroom.count({ where }),
  ])
  
  return {
    success: true,
    data: classrooms,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }
})
