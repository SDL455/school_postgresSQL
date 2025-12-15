import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, createAcademicYearSchema } from '~/server/utils/validation'

// POST /api/academic-years - Create a new academic year
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const body = await validateBody(event, createAcademicYearSchema)
  
  const academicYear = await prisma.academicYear.create({
    data: {
      yearName: body.yearName,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status || 'OPEN',
    },
    include: {
      terms: true,
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງປີຮຽນສຳເລັດ',
    data: academicYear
  }
})
