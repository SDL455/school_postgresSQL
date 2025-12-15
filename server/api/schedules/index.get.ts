import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/schedules - List schedules
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const classroomId = query.classroomId ? parseInt(query.classroomId as string) : null
  const teacherId = query.teacherId ? parseInt(query.teacherId as string) : null
  
  const where: any = {}
  
  if (classroomId) {
    where.classroomId = classroomId
  }
  
  if (teacherId) {
    where.teacherId = teacherId
  }
  
  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      classroom: {
        include: {
          gradeLevel: true,
        }
      },
      subject: true,
      teacher: true,
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' },
    ],
  })
  
  return {
    success: true,
    data: schedules,
  }
})
