import { prisma } from '../../utils/prisma'
import { requireAuth, canEnterGrades } from '../../utils/auth'

// GET /api/grades - List grades with filters
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  const query = getQuery(event)
  const classroomId = query.classroomId ? parseInt(query.classroomId as string) : null
  const subjectId = query.subjectId ? parseInt(query.subjectId as string) : null
  const termId = query.termId ? parseInt(query.termId as string) : null
  const academicYearId = query.academicYearId ? parseInt(query.academicYearId as string) : null
  const studentId = query.studentId ? parseInt(query.studentId as string) : null
  
  const where: any = {}
  
  if (classroomId) {
    where.student = {
      classroomId
    }
  }
  
  if (subjectId) {
    where.subjectId = subjectId
  }
  
  if (termId) {
    where.termId = termId
  }
  
  if (academicYearId) {
    where.academicYearId = academicYearId
  }
  
  if (studentId) {
    where.studentId = studentId
  }
  
  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: {
        include: {
          classroom: true,
        }
      },
      subject: true,
      term: true,
      academicYear: true,
    },
    orderBy: [
      { student: { firstName: 'asc' } },
      { subject: { subjectName: 'asc' } },
    ],
  })
  
  return {
    success: true,
    data: grades,
  }
})
