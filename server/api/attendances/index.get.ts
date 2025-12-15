import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/attendances - List attendances with filters
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const classroomId = query.classroomId ? parseInt(query.classroomId as string) : null
  const studentId = query.studentId ? parseInt(query.studentId as string) : null
  const termId = query.termId ? parseInt(query.termId as string) : null
  const date = query.date as string || null
  const startDate = query.startDate as string || null
  const endDate = query.endDate as string || null
  
  const where: any = {}
  
  if (classroomId) {
    where.classroomId = classroomId
  }
  
  if (studentId) {
    where.studentId = studentId
  }
  
  if (termId) {
    where.termId = termId
  }
  
  if (date) {
    where.date = new Date(date)
  }
  
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  }
  
  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      student: true,
      classroom: true,
      subject: true,
      term: true,
    },
    orderBy: [
      { date: 'desc' },
      { periodNumber: 'asc' },
    ],
  })
  
  return {
    success: true,
    data: attendances,
  }
})
