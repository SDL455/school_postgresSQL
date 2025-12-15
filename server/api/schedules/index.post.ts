import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { validateBody, createScheduleSchema } from '../../utils/validation'

// POST /api/schedules - Create a new schedule
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const body = await validateBody(event, createScheduleSchema)
  
  // Check for conflicts
  const conflict = await prisma.schedule.findFirst({
    where: {
      classroomId: body.classroomId,
      dayOfWeek: body.dayOfWeek,
      periodNumber: body.periodNumber,
    }
  })
  
  if (conflict) {
    throw createError({
      statusCode: 400,
      message: 'ມີຕາຕະລາງຊ້ຳກັນໃນຄາບນີ້ແລ້ວ'
    })
  }
  
  // Check teacher availability
  const teacherConflict = await prisma.schedule.findFirst({
    where: {
      teacherId: body.teacherId,
      dayOfWeek: body.dayOfWeek,
      periodNumber: body.periodNumber,
    }
  })
  
  if (teacherConflict) {
    throw createError({
      statusCode: 400,
      message: 'ອາຈານມີຕາຕະລາງຊ້ຳກັນໃນຄາບນີ້ແລ້ວ'
    })
  }
  
  const schedule = await prisma.schedule.create({
    data: {
      classroomId: body.classroomId,
      subjectId: body.subjectId,
      teacherId: body.teacherId,
      dayOfWeek: body.dayOfWeek,
      periodNumber: body.periodNumber,
      startTime: body.startTime,
      endTime: body.endTime,
    },
    include: {
      classroom: true,
      subject: true,
      teacher: true,
    }
  })
  
  return {
    success: true,
    message: 'ສ້າງຕາຕະລາງສຳເລັດ',
    data: schedule
  }
})
