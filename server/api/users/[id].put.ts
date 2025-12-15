import { prisma } from '~/server/utils/prisma'
import { requireRoles, hashPassword } from '~/server/utils/auth'
import { validateBody, updateUserSchema } from '~/server/utils/validation'

// PUT /api/users/:id - Update a user
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const body = await validateBody(event, updateUserSchema)
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  })
  
  if (!existingUser) {
    throw createError({
      statusCode: 404,
      message: 'ບໍ່ພົບຜູ້ໃຊ້'
    })
  }
  
  // Check if username already exists (if updating)
  if (body.username && body.username !== existingUser.username) {
    const existingUsername = await prisma.user.findUnique({
      where: { username: body.username }
    })
    
    if (existingUsername) {
      throw createError({
        statusCode: 400,
        message: 'ຊື່ຜູ້ໃຊ້ນີ້ມີຢູ່ແລ້ວ'
      })
    }
  }
  
  // Check if email already exists (if updating)
  if (body.email && body.email !== existingUser.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: body.email }
    })
    
    if (existingEmail) {
      throw createError({
        statusCode: 400,
        message: 'ອີເມວນີ້ມີຢູ່ແລ້ວ'
      })
    }
  }
  
  // Prepare update data
  const updateData: any = {}
  
  if (body.username) updateData.username = body.username
  if (body.email) updateData.email = body.email
  if (body.role) updateData.role = body.role
  if (body.status) updateData.status = body.status
  if (body.password) updateData.password = await hashPassword(body.password)
  
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  })
  
  return {
    success: true,
    message: 'ອັບເດດຜູ້ໃຊ້ສຳເລັດ',
    data: user
  }
})
