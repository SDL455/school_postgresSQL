import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { z } from 'zod'

const assignClassroomSchema = z.object({
  studentIds: z.array(z.number()).min(1, 'ກະລຸນາເລືອກນັກຮຽນ'),
  classroomId: z.number(),
})

// POST /api/students/assign-classroom - Assign students to classroom
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER', 'REGISTRAR'])
  
  const body = await readBody(event)
  const result = assignClassroomSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0]?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const { studentIds, classroomId } = result.data
  
  // Validate classroom
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: { gradeLevel: true }
  })
  
  if (!classroom) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບຫ້ອງຮຽນ'
    })
  }
  
  // Update all students
  await prisma.student.updateMany({
    where: {
      id: { in: studentIds }
    },
    data: {
      classroomId
    }
  })
  
  return {
    success: true,
    message: `ແຍກນັກຮຽນ ${studentIds.length} ຄົນ ເຂົ້າຫ້ອງ ${classroom.roomName} ສຳເລັດ`
  }
})
