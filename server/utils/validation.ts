import { z } from 'zod'

// User validation schemas
export const loginSchema = z.object({
  username: z.string().min(3, 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'),
})

export const createUserSchema = z.object({
  username: z.string().min(3, 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ').max(50),
  email: z.string().email('ອີເມວບໍ່ຖືກຕ້ອງ'),
  password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'),
  role: z.enum(['ADMIN', 'MANAGER', 'REGISTRAR', 'TEACHER']),
})

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'REGISTRAR', 'TEACHER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

// Student validation schemas
export const createStudentSchema = z.object({
  studentCode: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດນັກຮຽນ').max(20),
  firstName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່').max(100),
  lastName: z.string().min(1, 'ກະລຸນາປ້ອນນາມສະກຸນ').max(100),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().optional().nullable(),
  placeOfBirth: z.string().max(255).optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  guardianName: z.string().max(200).optional().nullable(),
  guardianPhone: z.string().max(20).optional().nullable(),
  guardianRelation: z.string().max(50).optional().nullable(),
  classroomId: z.number().optional().nullable(),
  status: z.enum(['STUDYING', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED', 'DROPPED']).optional(),
})

export const updateStudentSchema = createStudentSchema.partial()

// Teacher validation schemas
export const createTeacherSchema = z.object({
  teacherCode: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດອາຈານ').max(20),
  firstName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່').max(100),
  lastName: z.string().min(1, 'ກະລຸນາປ້ອນນາມສະກຸນ').max(100),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  mainSubject: z.string().max(100).optional().nullable(),
  department: z.enum(['MATH', 'SCIENCE', 'LANGUAGE', 'SOCIAL', 'ARTS', 'PHYSICAL', 'TECHNOLOGY', 'GENERAL']),
  status: z.enum(['FULLTIME', 'PARTTIME', 'RESIGNED']).optional(),
  userId: z.number().optional().nullable(),
})

export const updateTeacherSchema = createTeacherSchema.partial()

// Classroom validation schemas
export const createClassroomSchema = z.object({
  roomCode: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດຫ້ອງ').max(20),
  roomName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່ຫ້ອງ').max(50),
  section: z.number().min(1, 'ກະລຸນາປ້ອນໝາຍເລກຫ້ອງ'),
  capacity: z.number().optional().nullable(),
  gradeLevelId: z.number(),
  academicYearId: z.number(),
  homeroomTeacherId: z.number().optional().nullable(),
})

export const updateClassroomSchema = createClassroomSchema.partial()

// Subject validation schemas
export const createSubjectSchema = z.object({
  subjectCode: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດວິຊາ').max(20),
  subjectName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່ວິຊາ').max(100),
  description: z.string().optional().nullable(),
  credits: z.number().optional().nullable(),
  hoursPerWeek: z.number().optional().nullable(),
  department: z.enum(['MATH', 'SCIENCE', 'LANGUAGE', 'SOCIAL', 'ARTS', 'PHYSICAL', 'TECHNOLOGY', 'GENERAL']),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export const updateSubjectSchema = createSubjectSchema.partial()

// Grade validation schemas
export const createGradeSchema = z.object({
  studentId: z.number(),
  subjectId: z.number(),
  termId: z.number(),
  academicYearId: z.number(),
  midtermScore: z.number().min(0).max(100).optional().nullable(),
  finalScore: z.number().min(0).max(100).optional().nullable(),
  homeworkScore: z.number().min(0).max(100).optional().nullable(),
  quizScore: z.number().min(0).max(100).optional().nullable(),
  attendanceScore: z.number().min(0).max(100).optional().nullable(),
})

export const updateGradeSchema = z.object({
  midtermScore: z.number().min(0).max(100).optional().nullable(),
  finalScore: z.number().min(0).max(100).optional().nullable(),
  homeworkScore: z.number().min(0).max(100).optional().nullable(),
  quizScore: z.number().min(0).max(100).optional().nullable(),
  attendanceScore: z.number().min(0).max(100).optional().nullable(),
})

// Attendance validation schemas
export const createAttendanceSchema = z.object({
  studentId: z.number(),
  classroomId: z.number(),
  subjectId: z.number().optional().nullable(),
  termId: z.number(),
  date: z.string(),
  periodNumber: z.number().optional().nullable(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  note: z.string().optional().nullable(),
})

export const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  note: z.string().optional().nullable(),
})

// Schedule validation schemas
export const createScheduleSchema = z.object({
  classroomId: z.number(),
  subjectId: z.number(),
  teacherId: z.number(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  periodNumber: z.number().min(1).max(12),
  startTime: z.string(),
  endTime: z.string(),
})

export const updateScheduleSchema = createScheduleSchema.partial()

// Academic year validation schemas
export const createAcademicYearSchema = z.object({
  yearName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່ປີຮຽນ').max(20),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
})

export const updateAcademicYearSchema = createAcademicYearSchema.partial()

// Term validation schemas
export const createTermSchema = z.object({
  termName: z.string().min(1, 'ກະລຸນາປ້ອນຊື່ພາກຮຽນ').max(50),
  termNumber: z.number().min(1).max(4),
  startDate: z.string(),
  endDate: z.string(),
  academicYearId: z.number(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
})

export const updateTermSchema = createTermSchema.partial()

// Grade level validation schemas
export const createGradeLevelSchema = z.object({
  levelCode: z.string().min(1).max(10),
  levelName: z.string().min(1).max(50),
  levelOrder: z.number().min(1),
  description: z.string().max(255).optional().nullable(),
})

export const updateGradeLevelSchema = createGradeLevelSchema.partial()

// Utility function to validate request body
export async function validateBody<T>(event: any, schema: z.ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      message: errors[0]?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ',
      data: { errors },
    })
  }
  
  return result.data
}
