import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, updateStudentSchema } from '~/server/utils/validation'

// PUT /api/students/:id - Update a student
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER', 'REGISTRAR'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const body = await validateBody(event, updateStudentSchema)
  
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
  
  // Check if studentCode already exists (if updating)
  if (body.studentCode && body.studentCode !== existingStudent.studentCode) {
    const existing = await prisma.student.findUnique({
      where: { studentCode: body.studentCode }
    })
    
    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'ລະຫັດນັກຮຽນນີ້ມີຢູ່ແລ້ວ'
      })
    }
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
  
  const updateData: any = {}
  
  if (body.studentCode) updateData.studentCode = body.studentCode
  if (body.firstName) updateData.firstName = body.firstName
  if (body.lastName) updateData.lastName = body.lastName
  if (body.gender) updateData.gender = body.gender
  if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
  if (body.placeOfBirth !== undefined) updateData.placeOfBirth = body.placeOfBirth
  if (body.address !== undefined) updateData.address = body.address
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.email !== undefined) updateData.email = body.email
  if (body.guardianName !== undefined) updateData.guardianName = body.guardianName
  if (body.guardianPhone !== undefined) updateData.guardianPhone = body.guardianPhone
  if (body.guardianRelation !== undefined) updateData.guardianRelation = body.guardianRelation
  if (body.classroomId !== undefined) updateData.classroomId = body.classroomId
  if (body.status) updateData.status = body.status
  
  const student = await prisma.student.update({
    where: { id },
    data: updateData,
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
    message: 'ອັບເດດນັກຮຽນສຳເລັດ',
    data: student
  }
})
