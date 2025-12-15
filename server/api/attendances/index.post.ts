import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { z } from 'zod'

const bulkAttendanceSchema = z.object({
  classroomId: z.number(),
  termId: z.number(),
  date: z.string(),
  periodNumber: z.number().optional(),
  subjectId: z.number().optional(),
  attendances: z.array(z.object({
    studentId: z.number(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    note: z.string().optional(),
  }))
})

// POST /api/attendances - Bulk create/update attendances
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER', 'TEACHER'])
  
  const body = await readBody(event)
  const result = bulkAttendanceSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0]?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const { classroomId, termId, date, periodNumber, subjectId, attendances } = result.data
  
  // Validate classroom
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId }
  })
  
  if (!classroom) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບຫ້ອງຮຽນ'
    })
  }
  
  // Upsert attendances
  const results = await Promise.all(
    attendances.map(async (att) => {
      return prisma.attendance.upsert({
        where: {
          studentId_date_periodNumber: {
            studentId: att.studentId,
            date: new Date(date),
            periodNumber: periodNumber || 1,
          }
        },
        update: {
          status: att.status,
          note: att.note,
        },
        create: {
          studentId: att.studentId,
          classroomId,
          subjectId,
          termId,
          date: new Date(date),
          periodNumber: periodNumber || 1,
          status: att.status,
          note: att.note,
        }
      })
    })
  )
  
  return {
    success: true,
    message: `ບັນທຶກການເຂົ້າຮຽນ ${results.length} ລາຍການສຳເລັດ`,
    data: results
  }
})
