import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { validateBody, createSubjectSchema } from '../../utils/validation'
import { z } from 'zod'

const createSubjectWithGradeLevelsSchema = createSubjectSchema.extend({
  gradeLevelIds: z.array(z.number()).optional(),
})

// POST /api/subjects - Create a new subject
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const body = await readBody(event)
  const result = createSubjectWithGradeLevelsSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0]?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const { gradeLevelIds, ...subjectData } = result.data
  
  // Check if subjectCode already exists
  const existing = await prisma.subject.findUnique({
    where: { subjectCode: subjectData.subjectCode }
  })
  
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'ລະຫັດວິຊານີ້ມີຢູ່ແລ້ວ'
    })
  }
  
  const subject = await prisma.subject.create({
    data: {
      ...subjectData,
      status: subjectData.status || 'ACTIVE',
      subjectGradeLevels: gradeLevelIds && gradeLevelIds.length > 0 ? {
        create: gradeLevelIds.map(gradeLevelId => ({
          gradeLevelId,
        }))
      } : undefined,
    },
    include: {
      subjectGradeLevels: {
        include: {
          gradeLevel: true,
        }
      }
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງວິຊາສຳເລັດ',
    data: subject
  }
})
