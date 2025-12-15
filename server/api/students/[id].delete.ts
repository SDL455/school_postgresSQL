import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'

// DELETE /api/students/:id - Delete a student
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  // Check if student exists
  const existingStudent = await prisma.student.findUnique({
    where: { id }
  })
  
  if (!existingStudent) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບນັກຮຽນ'
    })
  }
  
  await prisma.student.delete({
    where: { id }
  })
  
  return {
    success: true,
    message: 'ລົບນັກຮຽນສຳເລັດ'
  }
})
