import { prisma } from '~/server/utils/prisma'
import { requireAuth } from '~/server/utils/auth'

// GET /api/dashboard/stats - Get dashboard statistics
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  
  const query = getQuery(event)
  const academicYearId = query.academicYearId ? parseInt(query.academicYearId as string) : null
  
  // Get the current or specified academic year
  let currentYear = null
  if (academicYearId) {
    currentYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    })
  } else {
    currentYear = await prisma.academicYear.findFirst({
      where: { status: 'OPEN' },
      orderBy: { startDate: 'desc' }
    })
  }
  
  // Basic counts
  const [
    totalStudents,
    activeStudents,
    maleStudents,
    femaleStudents,
    totalTeachers,
    activeTeachers,
    totalClassrooms,
    totalSubjects,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { status: 'STUDYING' } }),
    prisma.student.count({ where: { gender: 'MALE', status: 'STUDYING' } }),
    prisma.student.count({ where: { gender: 'FEMALE', status: 'STUDYING' } }),
    prisma.teacher.count(),
    prisma.teacher.count({ where: { status: { not: 'RESIGNED' } } }),
    currentYear ? prisma.classroom.count({ where: { academicYearId: currentYear.id } }) : prisma.classroom.count(),
    prisma.subject.count({ where: { status: 'ACTIVE' } }),
  ])
  
  // Students by status
  const studentsByStatus = await prisma.student.groupBy({
    by: ['status'],
    _count: { id: true },
  })
  
  // Teachers by department
  const teachersByDepartment = await prisma.teacher.groupBy({
    by: ['department'],
    _count: { id: true },
    where: { status: { not: 'RESIGNED' } },
  })
  
  // Students per classroom (for current year)
  let studentsPerClassroom: any[] = []
  if (currentYear) {
    studentsPerClassroom = await prisma.classroom.findMany({
      where: { academicYearId: currentYear.id },
      include: {
        gradeLevel: true,
        _count: {
          select: { students: true }
        },
        students: {
          select: { gender: true }
        }
      },
      orderBy: [
        { gradeLevel: { levelOrder: 'asc' } },
        { section: 'asc' },
      ]
    })
  }
  
  // Format classroom stats
  const classroomStats = studentsPerClassroom.map(c => ({
    id: c.id,
    roomName: c.roomName,
    gradeLevel: c.gradeLevel?.levelName,
    totalStudents: c._count.students,
    maleCount: c.students.filter((s: any) => s.gender === 'MALE').length,
    femaleCount: c.students.filter((s: any) => s.gender === 'FEMALE').length,
  }))
  
  // Grade statistics (pass/fail)
  let gradeStats: any = null
  if (currentYear) {
    const gradesData = await prisma.grade.groupBy({
      by: ['resultStatus'],
      _count: { id: true },
      where: { academicYearId: currentYear.id },
    })
    
    const passed = gradesData.find(g => g.resultStatus === 'PASS')?._count.id || 0
    const failed = gradesData.find(g => g.resultStatus === 'FAIL')?._count.id || 0
    
    gradeStats = {
      passed,
      failed,
      total: passed + failed,
      passRate: passed + failed > 0 ? ((passed / (passed + failed)) * 100).toFixed(1) : 0,
    }
  }
  
  // Attendance summary
  let attendanceStats: any = null
  if (currentYear) {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    
    const attendanceData = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        term: {
          academicYearId: currentYear.id,
        },
        date: {
          gte: last30Days,
        }
      },
    })
    
    attendanceStats = {
      present: attendanceData.find(a => a.status === 'PRESENT')?._count.id || 0,
      absent: attendanceData.find(a => a.status === 'ABSENT')?._count.id || 0,
      late: attendanceData.find(a => a.status === 'LATE')?._count.id || 0,
      excused: attendanceData.find(a => a.status === 'EXCUSED')?._count.id || 0,
    }
  }
  
  return {
    success: true,
    data: {
      currentAcademicYear: currentYear,
      overview: {
        totalStudents,
        activeStudents,
        maleStudents,
        femaleStudents,
        totalTeachers,
        activeTeachers,
        totalClassrooms,
        totalSubjects,
      },
      studentsByStatus,
      teachersByDepartment,
      classroomStats,
      gradeStats,
      attendanceStats,
    }
  }
})
