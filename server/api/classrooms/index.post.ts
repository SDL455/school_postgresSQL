import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, createClassroomSchema } from '~/server/utils/validation'

// POST /api/classrooms - Create a new classroom
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const body = await validateBody(event, createClassroomSchema)
  
  // Check if roomCode already exists
  const existing = await prisma.classroom.findUnique({
    where: { roomCode: body.roomCode }
  })
  
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'ລະຫັດຫ້ອງນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  // Validate gradeLevel
  const gradeLevel = await prisma.gradeLevel.findUnique({
    where: { id: body.gradeLevelId }
  })
  
  if (!gradeLevel) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບຊັ້ນຮຽນ'
    })
  }
  
  // Validate academicYear
  const academicYear = await prisma.academicYear.findUnique({
    where: { id: body.academicYearId }
  })
  
  if (!academicYear) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບປີຮຽນ'
    })
  }
  
  // Validate homeroomTeacher if provided
  if (body.homeroomTeacherId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: body.homeroomTeacherId }
    })
    
    if (!teacher) {
      throw createError({
        statusCode: 400,
        message: 'ບໍ່ພົບອາຈານ'
      })
    }
  }
  
  const classroom = await prisma.classroom.create({
    data: {
      roomCode: body.roomCode,
      roomName: body.roomName,
      section: body.section,
      capacity: body.capacity,
      gradeLevelId: body.gradeLevelId,
      academicYearId: body.academicYearId,
      homeroomTeacherId: body.homeroomTeacherId,
    },
    include: {
      gradeLevel: true,
      academicYear: true,
      homeroomTeacher: true,
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງຫ້ອງຮຽນສຳເລັດ',
    data: classroom
  }
})
