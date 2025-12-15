import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, updateClassroomSchema } from '~/server/utils/validation'

// PUT /api/classrooms/:id - Update a classroom
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const body = await validateBody(event, updateClassroomSchema)
  
  // Check if classroom exists
  const existingClassroom = await prisma.classroom.findUnique({
    where: { id }
  })
  
  if (!existingClassroom) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບຫ້ອງຮຽນ'
    })
  }
  
  // Check if roomCode already exists
  if (body.roomCode && body.roomCode !== existingClassroom.roomCode) {
    const existing = await prisma.classroom.findUnique({
      where: { roomCode: body.roomCode }
    })
    
    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'ລະຫັດຫ້ອງນີ້ມີຢູ່ແລ້ວ'
      })
    }
  }
  
  const updateData: any = {}
  
  if (body.roomCode) updateData.roomCode = body.roomCode
  if (body.roomName) updateData.roomName = body.roomName
  if (body.section) updateData.section = body.section
  if (body.capacity !== undefined) updateData.capacity = body.capacity
  if (body.gradeLevelId) updateData.gradeLevelId = body.gradeLevelId
  if (body.academicYearId) updateData.academicYearId = body.academicYearId
  if (body.homeroomTeacherId !== undefined) updateData.homeroomTeacherId = body.homeroomTeacherId
  
  const classroom = await prisma.classroom.update({
    where: { id },
    data: updateData,
    include: {
      gradeLevel: true,
      academicYear: true,
      homeroomTeacher: true,
    }
  })
  
  return {
    success: true,
    message: 'ອັບເດດຫ້ອງຮຽນສຳເລັດ',
    data: classroom
  }
})
