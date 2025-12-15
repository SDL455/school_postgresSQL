import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 ເລີ່ມສ້າງຂໍ້ມູນເລີ່ມຕົ້ນ...')
  
  // Create Admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@school.la',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  })
  console.log('✅ ສ້າງ Admin:', admin.username)
  
  // Create Manager user
  const managerPassword = await bcrypt.hash('manager123', 10)
  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@school.la',
      password: managerPassword,
      role: 'MANAGER',
      status: 'ACTIVE',
    }
  })
  console.log('✅ ສ້າງ Manager:', manager.username)
  
  // Create Registrar user
  const registrarPassword = await bcrypt.hash('registrar123', 10)
  const registrar = await prisma.user.upsert({
    where: { username: 'registrar' },
    update: {},
    create: {
      username: 'registrar',
      email: 'registrar@school.la',
      password: registrarPassword,
      role: 'REGISTRAR',
      status: 'ACTIVE',
    }
  })
  console.log('✅ ສ້າງ Registrar:', registrar.username)
  
  // Create Grade Levels
  const gradeLevelsData = [
    { levelCode: 'M1', levelName: 'ມ.1', levelOrder: 1, description: 'ມັດທະຍົມສຶກສາປີທີ 1' },
    { levelCode: 'M2', levelName: 'ມ.2', levelOrder: 2, description: 'ມັດທະຍົມສຶກສາປີທີ 2' },
    { levelCode: 'M3', levelName: 'ມ.3', levelOrder: 3, description: 'ມັດທະຍົມສຶກສາປີທີ 3' },
    { levelCode: 'M4', levelName: 'ມ.4', levelOrder: 4, description: 'ມັດທະຍົມສຶກສາປີທີ 4' },
    { levelCode: 'M5', levelName: 'ມ.5', levelOrder: 5, description: 'ມັດທະຍົມສຶກສາປີທີ 5' },
    { levelCode: 'M6', levelName: 'ມ.6', levelOrder: 6, description: 'ມັດທະຍົມສຶກສາປີທີ 6' },
    { levelCode: 'M7', levelName: 'ມ.7', levelOrder: 7, description: 'ມັດທະຍົມສຶກສາປີທີ 7' },
  ]
  
  for (const data of gradeLevelsData) {
    await prisma.gradeLevel.upsert({
      where: { levelCode: data.levelCode },
      update: {},
      create: data,
    })
  }
  console.log('✅ ສ້າງ Grade Levels:', gradeLevelsData.length, 'ຊັ້ນ')
  
  // Create Academic Year
  const year = await prisma.academicYear.upsert({
    where: { id: 1 },
    update: {},
    create: {
      yearName: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      status: 'OPEN',
    }
  })
  console.log('✅ ສ້າງ Academic Year:', year.yearName)
  
  // Create Terms
  const term1 = await prisma.term.upsert({
    where: { id: 1 },
    update: {},
    create: {
      termName: 'ພາກຮຽນທີ 1',
      termNumber: 1,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-01-31'),
      academicYearId: year.id,
      status: 'OPEN',
    }
  })
  
  await prisma.term.upsert({
    where: { id: 2 },
    update: {},
    create: {
      termName: 'ພາກຮຽນທີ 2',
      termNumber: 2,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-30'),
      academicYearId: year.id,
      status: 'CLOSED',
    }
  })
  console.log('✅ ສ້າງ Terms: 2 ພາກ')
  
  // Create Subjects
  const subjectsData = [
    { subjectCode: 'MATH', subjectName: 'ຄະນິດສາດ', department: 'MATH' as const, hoursPerWeek: 5, credits: 3 },
    { subjectCode: 'PHY', subjectName: 'ຟີຊິກ', department: 'SCIENCE' as const, hoursPerWeek: 4, credits: 2 },
    { subjectCode: 'CHEM', subjectName: 'ເຄມີ', department: 'SCIENCE' as const, hoursPerWeek: 4, credits: 2 },
    { subjectCode: 'BIO', subjectName: 'ຊີວະວິທະຍາ', department: 'SCIENCE' as const, hoursPerWeek: 3, credits: 2 },
    { subjectCode: 'LAO', subjectName: 'ພາສາລາວ', department: 'LANGUAGE' as const, hoursPerWeek: 5, credits: 3 },
    { subjectCode: 'ENG', subjectName: 'ພາສາອັງກິດ', department: 'LANGUAGE' as const, hoursPerWeek: 4, credits: 2 },
    { subjectCode: 'FRE', subjectName: 'ພາສາຝຣັ່ງ', department: 'LANGUAGE' as const, hoursPerWeek: 3, credits: 2 },
    { subjectCode: 'HIS', subjectName: 'ປະຫວັດສາດ', department: 'SOCIAL' as const, hoursPerWeek: 2, credits: 1 },
    { subjectCode: 'GEO', subjectName: 'ພູມສາດ', department: 'SOCIAL' as const, hoursPerWeek: 2, credits: 1 },
    { subjectCode: 'PE', subjectName: 'ພະລະສຶກສາ', department: 'PHYSICAL' as const, hoursPerWeek: 2, credits: 1 },
    { subjectCode: 'ART', subjectName: 'ສິລະປະ', department: 'ARTS' as const, hoursPerWeek: 2, credits: 1 },
    { subjectCode: 'ICT', subjectName: 'ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', department: 'TECHNOLOGY' as const, hoursPerWeek: 2, credits: 1 },
  ]
  
  for (const data of subjectsData) {
    await prisma.subject.upsert({
      where: { subjectCode: data.subjectCode },
      update: {},
      create: {
        ...data,
        status: 'ACTIVE',
      },
    })
  }
  console.log('✅ ສ້າງ Subjects:', subjectsData.length, 'ວິຊາ')
  
  // Create sample Teachers
  const teachersData = [
    { teacherCode: 'T001', firstName: 'ສົມພອນ', lastName: 'ແກ້ວມະນີ', gender: 'MALE' as const, department: 'MATH' as const, mainSubject: 'ຄະນິດສາດ' },
    { teacherCode: 'T002', firstName: 'ບຸນມີ', lastName: 'ສີລິພັນ', gender: 'MALE' as const, department: 'SCIENCE' as const, mainSubject: 'ຟີຊິກ' },
    { teacherCode: 'T003', firstName: 'ນາງ ຄຳຫຼ້າ', lastName: 'ວົງວິໄລ', gender: 'FEMALE' as const, department: 'LANGUAGE' as const, mainSubject: 'ພາສາລາວ' },
    { teacherCode: 'T004', firstName: 'ສີສະຫວາດ', lastName: 'ພົມມະຈັນ', gender: 'MALE' as const, department: 'LANGUAGE' as const, mainSubject: 'ພາສາອັງກິດ' },
    { teacherCode: 'T005', firstName: 'ນາງ ອຳພອນ', lastName: 'ສຸກສະຫວັນ', gender: 'FEMALE' as const, department: 'SOCIAL' as const, mainSubject: 'ປະຫວັດສາດ' },
  ]
  
  for (const data of teachersData) {
    await prisma.teacher.upsert({
      where: { teacherCode: data.teacherCode },
      update: {},
      create: {
        ...data,
        status: 'FULLTIME',
        phone: '020 XXXX XXXX',
      },
    })
  }
  console.log('✅ ສ້າງ Teachers:', teachersData.length, 'ຄົນ')
  
  // Create sample Classrooms
  const gradeLevels = await prisma.gradeLevel.findMany()
  const teachers = await prisma.teacher.findMany()
  
  let classroomCount = 0
  for (const level of gradeLevels.slice(0, 4)) { // Create for M1-M4
    for (let section = 1; section <= 2; section++) {
      const roomCode = `${level.levelCode}-${section}`
      const roomName = `${level.levelName}/${section}`
      
      const teacher = teachers[classroomCount % teachers.length]
      
      await prisma.classroom.upsert({
        where: { roomCode },
        update: {},
        create: {
          roomCode,
          roomName,
          section,
          capacity: 40,
          gradeLevelId: level.id,
          academicYearId: year.id,
          homeroomTeacherId: teacher?.id,
        },
      })
      classroomCount++
    }
  }
  console.log('✅ ສ້າງ Classrooms:', classroomCount, 'ຫ້ອງ')
  
  // Create sample Students
  const classrooms = await prisma.classroom.findMany()
  const firstNames = ['ສົມໃຈ', 'ບຸນເລີດ', 'ວິໄລ', 'ສຸວັນນາ', 'ພອນໄຊ', 'ດາວ', 'ແສງຈັນ', 'ມາລີ', 'ສຸກໃສ', 'ອຳພອນ']
  const lastNames = ['ແກ້ວມະນີ', 'ສີລິພັນ', 'ວົງວິໄລ', 'ພົມມະຈັນ', 'ສຸກສະຫວັນ', 'ໄຊຍະວົງ', 'ບຸນຍະວົງ', 'ອິນທະວົງ']
  
  let studentCount = 0
  for (const classroom of classrooms) {
    for (let i = 0; i < 10; i++) { // 10 students per class
      const studentCode = `STU${year.yearName.split('-')[0]}${String(studentCount + 1).padStart(4, '0')}`
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
      
      await prisma.student.upsert({
        where: { studentCode },
        update: {},
        create: {
          studentCode,
          firstName,
          lastName,
          gender: gender as any,
          dateOfBirth: new Date(2008 - Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          classroomId: classroom.id,
          status: 'STUDYING',
          guardianName: `ພໍ່ແມ່ ${firstName}`,
          guardianPhone: '020 XXXX XXXX',
        },
      })
      studentCount++
    }
  }
  console.log('✅ ສ້າງ Students:', studentCount, 'ຄົນ')
  
  console.log('\n🎉 ສ້າງຂໍ້ມູນເລີ່ມຕົ້ນສຳເລັດ!')
  console.log('\n📌 ຂໍ້ມູນ Login:')
  console.log('   Admin: admin / admin123')
  console.log('   Manager: manager / manager123')
  console.log('   Registrar: registrar / registrar123')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
