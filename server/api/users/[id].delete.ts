import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'

// DELETE /api/users/:id - Delete a user
export default defineEventHandler(async (event) => {
  const currentUser = await requireRoles(event, ['ADMIN'])
  
  const id = parseInt(getRouterParam(event, 'id') as string)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'ID ບໍ່ຖືກຕ້ອງ'
    })
  }
  
  // Prevent self-deletion
  if (currentUser.id === id) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ສາມາດລົບບັນຊີຂອງຕົນເອງໄດ້'
    })
  }
  
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
  
  await prisma.user.delete({
    where: { id }
  })
  
  return {
    success: true,
    message: 'ລົບຜູ້ໃຊ້ສຳເລັດ'
  }
})
