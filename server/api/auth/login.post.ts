import { prisma } from '~/server/utils/prisma'
import { comparePassword, generateToken } from '~/server/utils/auth'
import { validateBody, loginSchema } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const body = await validateBody(event, loginSchema)
  
  // Find user by username
  const user = await prisma.user.findUnique({
    where: { username: body.username },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  })
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    })
  }
  
  // Check password
  const isValidPassword = await comparePassword(body.password, user.password)
  
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
    })
  }
  
  // Check user status
  if (user.status !== 'ACTIVE') {
    throw createError({
      statusCode: 403,
      message: 'ບັນຊີຂອງທ່ານຖືກລະງັບ'
    })
  }
  
  // Generate token
  const token = generateToken({ userId: user.id, role: user.role })
  
  return {
    success: true,
    message: 'ເຂົ້າສູ່ລະບົບສຳເລັດ',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        teacher: user.teacher,
      }
    }
  }
})
