import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { validateBody, updateTeacherSchema } from '../../utils/validation'

// PUT /api/teachers/:id - Update a teacher
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const body = await validateBody(event, updateTeacherSchema)
  
  // Check if teacher exists
  const existingTeacher = await prisma.teacher.findUnique({
    where: { id }
  })
  
  if (!existingTeacher) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບອາຈານ'
    })
  }
  
  // Check if teacherCode already exists (if updating)
  if (body.teacherCode && body.teacherCode !== existingTeacher.teacherCode) {
    const existing = await prisma.teacher.findUnique({
      where: { teacherCode: body.teacherCode }
    })
    
    if (existing) {
      throw createError({
        statusCode: 400,
        message: 'ລະຫັດອາຈານນີ້ມີຢູ່ແລ້ວ'
      })
    }
  }
  
  const updateData: any = {}
  
  if (body.teacherCode) updateData.teacherCode = body.teacherCode
  if (body.firstName) updateData.firstName = body.firstName
  if (body.lastName) updateData.lastName = body.lastName
  if (body.gender) updateData.gender = body.gender
  if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.email !== undefined) updateData.email = body.email
  if (body.address !== undefined) updateData.address = body.address
  if (body.mainSubject !== undefined) updateData.mainSubject = body.mainSubject
  if (body.department) updateData.department = body.department
  if (body.status) updateData.status = body.status
  if (body.userId !== undefined) updateData.userId = body.userId
  
  const teacher = await prisma.teacher.update({
    where: { id },
    data: updateData,
    include: {
      homeroomClassrooms: {
        include: {
          gradeLevel: true,
        }
      }
    }
  })
  
  return {
    success: true,
    message: 'ອັບເດດອາຈານສຳເລັດ',
    data: teacher
  }
})
