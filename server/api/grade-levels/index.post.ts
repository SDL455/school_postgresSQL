import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { validateBody, createGradeLevelSchema } from '~/server/utils/validation'

// POST /api/grade-levels - Create a new grade level
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN'])
  
  const body = await validateBody(event, createGradeLevelSchema)
  
  // Check if levelCode already exists
  const existing = await prisma.gradeLevel.findUnique({
    where: { levelCode: body.levelCode }
  })
  
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'ລະຫັດຊັ້ນນີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  const gradeLevel = await prisma.gradeLevel.create({
    data: {
      levelCode: body.levelCode,
      levelName: body.levelName,
      levelOrder: body.levelOrder,
      description: body.description,
    },
  })
  
  return {
    success: true,
    message: 'ສ້າງຊັ້ນຮຽນສຳເລັດ',
    data: gradeLevel
  }
})
