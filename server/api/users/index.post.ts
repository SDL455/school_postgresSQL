import { prisma } from '~/server/utils/prisma'
import { requireRoles, hashPassword } from '~/server/utils/auth'
import { validateBody, createUserSchema } from '~/server/utils/validation'

// POST /api/users - Create a new user
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const body = await validateBody(event, createUserSchema)
  
  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username: body.username }
  })
  
  if (existingUsername) {
    throw createError({
      statusCode: 400,
      message: 'ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: body.email }
  })
  
  if (existingEmail) {
    throw createError({
      statusCode: 400,
      message: 'ອີເມວນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  // Hash password
  const hashedPassword = await hashPassword(body.password)
  
  const user = await prisma.user.create({
    data: {
      username: body.username,
      email: body.email,
      password: hashedPassword,
      role: body.role,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງບັນຊີຜູ້ໃຊ້ສຳເລັດ',
    data: user
  }
})
