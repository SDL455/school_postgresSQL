import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

// GET /api/grade-levels - List all grade levels
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const gradeLevels = await prisma.gradeLevel.findMany({
    include: {
      _count: {
        select: { classrooms: true }
      }
    },
    orderBy: { levelOrder: 'asc' },
  })
  
  return {
    success: true,
    data: gradeLevels,
  }
})
