import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, createTeacherSchema } from '~/server/utils/validation'

// POST /api/teachers - Create a new teacher
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const body = await validateBody(event, createTeacherSchema)
  
  // Check if teacherCode already exists
  const existing = await prisma.teacher.findUnique({
    where: { teacherCode: body.teacherCode }
  })
  
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'ລະຫັດອາຈານນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  const teacher = await prisma.teacher.create({
    data: {
      teacherCode: body.teacherCode,
      firstName: body.firstName,
      lastName: body.lastName,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      phone: body.phone,
      email: body.email,
      address: body.address,
      mainSubject: body.mainSubject,
      department: body.department,
      status: body.status || 'FULLTIME',
      userId: body.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        }
      }
    }
  })
  
  return {
    success: true,
    message: 'ເພີ່ມອາຈານສຳເລັດ',
    data: teacher
  }
})
