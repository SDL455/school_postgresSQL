import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'

// DELETE /api/teachers/:id - Delete a teacher
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  // Check if teacher exists
  const existingTeacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      homeroomClassrooms: true,
      teachingAssignments: true,
    }
  })
  
  if (!existingTeacher) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບອາຈານ'
    })
  }
  
  // Check if teacher has homeroom classrooms
  if (existingTeacher.homeroomClassrooms.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ສາມາດລົບອາຈານທີ່ເປັນຄູປະຈຳຫ້ອງໄດ້'
    })
  }
  
  // Delete teaching assignments first
  await prisma.teachingAssignment.deleteMany({
    where: { teacherId: id }
  })
  
  await prisma.teacher.delete({
    where: { id }
  })
  
  return {
    success: true,
    message: 'ລົບອາຈານສຳເລັດ'
  }
})
