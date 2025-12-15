import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { validateBody, createStudentSchema } from '../../utils/validation'

// POST /api/students - Create a new student
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER', 'REGISTRAR'])
  
  const body = await validateBody(event, createStudentSchema)
  
  // Check if studentCode already exists
  const existing = await prisma.student.findUnique({
    where: { studentCode: body.studentCode }
  })
  
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'ລະຫັດນັກຮຽນນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  // Validate classroomId if provided
  if (body.classroomId) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: body.classroomId }
    })
    
    if (!classroom) {
      throw createError({
        statusCode: 400,
        message: 'ບໍ່ພົບຫ້ອງຮຽນ'
      })
    }
  }
  
  const student = await prisma.student.create({
    data: {
      studentCode: body.studentCode,
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      placeOfBirth: body.placeOfBirth,
      address: body.address,
      phone: body.phone,
      email: body.email,
      guardianName: body.guardianName,
      guardianPhone: body.guardianPhone,
      guardianRelation: body.guardianRelation,
      classroomId: body.classroomId,
      status: body.status || 'STUDYING',
    },
    include: {
      classroom: {
        include: {
          gradeLevel: true,
        }
      }
    }
  })
  
  return {
    success: true,
    message: 'ລົງທະບຽນນັກຮຽນສຳເລັດ',
    data: student
  }
})
