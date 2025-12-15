import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

// GET /api/academic-years - List all academic years
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const all = query.all === 'true'
  
  const academicYears = await prisma.academicYear.findMany({
    include: {
      terms: {
        orderBy: { termNumber: 'asc' }
      },
      _count: {
        select: { classrooms: true }
      }
    },
    orderBy: { startDate: 'desc' },
  })
  
  return {
    success: true,
    data: academicYears,
  }
})
