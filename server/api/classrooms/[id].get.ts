import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/classrooms/:id - Get a single classroom with students
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      gradeLevel: true,
      academicYear: true,
      homeroomTeacher: true,
      students: {
        orderBy: [
          { gender: 'asc' },
          { firstName: 'asc' },
        ]
      },
      teachingAssignments: {
        include: {
          teacher: true,
          subject: true,
        }
      },
      schedules: {
        include: {
          teacher: true,
          subject: true,
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { periodNumber: 'asc' },
        ]
      }
    }
  })
  
  if (!classroom) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບຫ້ອງຮຽນ'
    })
  }
  
  // Calculate student statistics
  const maleCount = classroom.students.filter(s => s.gender === 'MALE').length
  const femaleCount = classroom.students.filter(s => s.gender === 'FEMALE').length
  
  return {
    success: true,
    data: {
      ...classroom,
      statistics: {
        totalStudents: classroom.students.length,
        maleCount,
        femaleCount,
      }
    }
  }
})
