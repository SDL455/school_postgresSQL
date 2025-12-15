import { prisma } from '../../utils/prisma'
import { requireRoles } from '../../utils/auth'
import { validateBody, createGradeSchema } from '../../utils/validation'

// POST /api/grades - Create or update a grade
export default defineEventHandler(async (event) => {
  await requireRoles(event, ['ADMIN', 'MANAGER', 'TEACHER'])
  
  const body = await validateBody(event, createGradeSchema)
  
  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { id: body.studentId }
  })
  
  if (!student) {
    throw createError({
      statusCode: 400,
      message: 'ບໍ່ພົບນັກຮຽນ'
    })
  }
  
  // Calculate total score (weighted average)
  const midterm = body.midtermScore || 0
  const final = body.finalScore || 0
  const homework = body.homeworkScore || 0
  const quiz = body.quizScore || 0
  const attendance = body.attendanceScore || 0
  
  // Default weights: midterm 20%, final 40%, homework 15%, quiz 15%, attendance 10%
  const totalScore = (midterm * 0.2) + (final * 0.4) + (homework * 0.15) + (quiz * 0.15) + (attendance * 0.1)
  
  // Determine pass/fail (default passing score: 50)
  const resultStatus = totalScore >= 50 ? 'PASS' : 'FAIL'
  
  // Upsert grade
  const grade = await prisma.grade.upsert({
    where: {
      studentId_subjectId_termId_academicYearId: {
        studentId: body.studentId,
        subjectId: body.subjectId,
        termId: body.termId,
        academicYearId: body.academicYearId,
      }
    },
    update: {
      midtermScore: body.midtermScore,
      finalScore: body.finalScore,
      homeworkScore: body.homeworkScore,
      quizScore: body.quizScore,
      attendanceScore: body.attendanceScore,
      totalScore,
      resultStatus,
    },
    create: {
      studentId: body.studentId,
      subjectId: body.subjectId,
      termId: body.termId,
      academicYearId: body.academicYearId,
      midtermScore: body.midtermScore,
      finalScore: body.finalScore,
      homeworkScore: body.homeworkScore,
      quizScore: body.quizScore,
      attendanceScore: body.attendanceScore,
      totalScore,
      resultStatus,
    },
    include: {
      student: true,
      subject: true,
      term: true,
    }
  })
  
  return {
    success: true,
    message: 'ບັນທຶກຄະແນນສຳເລັດ',
    data: grade
  }
})
