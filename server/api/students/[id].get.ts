import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/students/:id - Get a single student
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      classroom: {
        include: {
          gradeLevel: true,
          homeroomTeacher: true,
        }
      },
      grades: {
        include: {
          subject: true,
          term: true,
        },
        orderBy: [
          { academicYearId: 'desc' },
          { termId: 'desc' },
        ]
      },
      attendances: {
        orderBy: { date: 'desc' },
        take: 30,
      }
    }
  })
  
  if (!student) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບນັກຮຽນ'
    })
  }
  
  return {
    success: true,
    data: student
  }
})
