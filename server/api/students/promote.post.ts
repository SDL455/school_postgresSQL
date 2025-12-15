import { prisma } from '~/server/utils/prisma'
import { requireRoles } from '~/server/utils/auth'
import { z } from 'zod'

const promoteStudentsSchema = z.object({
  academicYearId: z.number(),
  fromClassroomId: z.number(),
  toClassroomId: z.number(),
  studentIds: z.array(z.number()).optional(), // If not provided, promote all passing students
  promoteAll: z.boolean().optional(),
})

// POST /api/students/promote - Promote students to next grade
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER'])
  
  const body = await readBody(event)
  const result = promoteStudentsSchema.safeParse(body)
  
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0]?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    })
  }
  
  const { academicYearId, fromClassroomId, toClassroomId, studentIds, promoteAll } = result.data
  
  // Validate classrooms
  const fromClassroom = await prisma.classroom.findUnique({
    where: { id: fromClassroomId },
    include: { gradeLevel: true }
  })
  
  const toClassroom = await prisma.classroom.findUnique({
    where: { id: toClassroomId },
    include: { gradeLevel: true }
  })
  
  if (!fromClassroom || !toClassroom) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບຫ້ອງຮຽນ'
    })
  }
  
  let studentsToPromote: number[] = []
  
  if (studentIds && studentIds.length > 0) {
    // Promote specific students
    studentsToPromote = studentIds
  } else if (promoteAll) {
    // Promote all students in the classroom
    const students = await prisma.student.findMany({
      where: { classroomId: fromClassroomId },
      select: { id: true }
    })
    studentsToPromote = students.map(s => s.id)
  } else {
    // Promote only passing students
    const passingGrades = await prisma.grade.findMany({
      where: {
        academicYearId,
        resultStatus: 'PASS',
        student: {
          classroomId: fromClassroomId
        }
      },
      select: {
        studentId: true,
      },
      distinct: ['studentId']
    })
    studentsToPromote = passingGrades.map(g => g.studentId)
  }
  
  if (studentsToPromote.length === 0) {
    return {
      success: false,
      message: 'ບໍ່ມີນັກຮຽນທີ່ຈະຍ້າຍ'
    }
  }
  
  // Update students' classroom
  await prisma.student.updateMany({
    where: {
      id: { in: studentsToPromote }
    },
    data: {
      classroomId: toClassroomId
    }
  })
  
  return {
    success: true,
    message: `ຍ້າຍນັກຮຽນ ${studentsToPromote.length} ຄົນ ຈາກ ${fromClassroom.roomName} ໄປ ${toClassroom.roomName} ສຳເລັດ`,
    data: {
      promotedCount: studentsToPromote.length,
      studentIds: studentsToPromote,
    }
  }
})
