import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, createTermSchema } from '~/server/utils/validation'

// POST /api/terms - Create a new term
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const body = await validateBody(event, createTermSchema)
  
  // Check if academicYear exists
  const academicYear = await prisma.academicYear.findUnique({
    where: { id: body.academicYearId }
  })
  
  if (!academicYear) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບປີຮຽນ'
    })
  }
  
  const term = await prisma.term.create({
    data: {
      termName: body.termName,
      termNumber: body.termNumber,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      academicYearId: body.academicYearId,
      status: body.status || 'OPEN',
    },
    include: {
      academicYear: true,
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງພາກຮຽນສຳເລັດ',
    data: term
  }
})
