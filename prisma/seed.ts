import { PrismaClient, AdminLevel, UserStatus, StudentStatus, TeacherStatus, ClassLevel, AcademicYearStatus } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: En production, générer de vrais hashs bcrypt
// const bcrypt = require('bcryptjs');
// const hash = (pw: string) => bcrypt.hashSync(pw, 10);
const HASH_PLACEHOLDER = (pw: string) => `HASH_${pw.toUpperCase()}_PLACEHOLDER`;

async function main() {
  console.log('🌱 Démarrage du seed AL-BAYAAN...');

  // ---------- École ----------
  // Idempotent : met à jour l'école existante (slug al-bayaan) puis la crée si besoin.
  const schoolData = {
    name: 'AL-BAYAAN',
    slug: 'al-bayaan',
    address: 'Adresse de l’école',
    phone: '+213 555 000 000',
    email: 'contact@albayan.edu',
  };
  const existingSchool = await prisma.school.findUnique({ where: { slug: 'al-bayaan' } });
  const school = existingSchool
    ? await prisma.school.update({ where: { slug: 'al-bayaan' }, data: schoolData })
    : await prisma.school.create({ data: { id: 'school-1', ...schoolData } });

  console.log('✅ École créée:', school.name);

  // ---------- Années scolaires ----------
  const years = [
    { id: 'ay-2024-2025', name: '2024-2025', start: new Date('2024-09-01'), end: new Date('2025-07-01'), status: AcademicYearStatus.PREVIOUS, active: false },
    { id: 'ay-2025-2026', name: '2025-2026', start: new Date('2025-09-01'), end: new Date('2026-07-01'), status: AcademicYearStatus.CURRENT, active: true },
    { id: 'ay-2026-2027', name: '2026-2027', start: new Date('2026-09-01'), end: new Date('2027-07-01'), status: AcademicYearStatus.UPCOMING, active: false },
  ];
  for (const y of years) {
    await prisma.academicYear.upsert({
      where: { name: y.name },
      update: { status: y.status, isActive: y.active },
      create: {
        id: y.id,
        name: y.name,
        startDate: y.start,
        endDate: y.end,
        status: y.status,
        isActive: y.active,
      },
    });
  }
  console.log('✅ Années scolaires créées:', years.map((y) => y.name).join(', '));

  // ---------- Utilisateurs (table commune SANS rôle) ----------
  const users = [
    {
      id: 'user-admin',
      email: 'admin@school.com',
      firstName: 'Admin',
      lastName: 'School',
      schoolId: school.id,
      password: HASH_PLACEHOLDER('admin123'),
    },
    {
      id: 'user-teacher-1',
      email: 'teacher@school.com',
      firstName: 'Imane',
      lastName: 'Mahmoud',
      schoolId: school.id,
      password: HASH_PLACEHOLDER('teacher123'),
    },
    {
      id: 'user-student-1',
      email: 'student@school.com',
      firstName: 'Youssef',
      lastName: 'Ait',
      schoolId: school.id,
      password: HASH_PLACEHOLDER('student123'),
    },
    {
      id: 'user-parent-1',
      email: 'parent@school.com',
      firstName: 'Karim',
      lastName: 'El Amrani',
      schoolId: school.id,
      password: HASH_PLACEHOLDER('parent123'),
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.password,
        firstName: u.firstName,
        lastName: u.lastName,
        status: UserStatus.ACTIVE,
        schoolId: u.schoolId,
      },
    });
  }
  console.log('✅ Utilisateurs créés:', users.map((u) => u.email).join(', '));

  // ---------- PROFIL ADMINISTRATEUR (table séparée) ----------
  await prisma.admin.upsert({
    where: { id: 'admin-1' },
    update: {},
    create: {
      id: 'admin-1',
      matricule: 'ALB-A-001',
      adminLevel: AdminLevel.SCHOOL_ADMIN,
      permissions: ['dashboard', 'students', 'teachers', 'classes', 'reports', 'payments'],
      userId: 'user-admin',
      schoolId: school.id,
    },
  });
  console.log('✅ Administrateur créé (table admins séparée)');

  // ---------- PROFIL ENSEIGNANT (table séparée) ----------
  await prisma.teacherProfile.upsert({
    where: { id: 'teacher-1' },
    update: {},
    create: {
      id: 'teacher-1',
      matricule: 'ALB-T-001',
      hireDate: new Date('2020-09-01'),
      status: TeacherStatus.ACTIVE,
      subjects: ['Mathématiques', 'Sciences'],
      userId: 'user-teacher-1',
      schoolId: school.id,
    },
  });
  console.log('✅ Enseignant créé (table teacher_profiles séparée)');

  // ---------- PROFIL ÉLÈVE (table séparée) ----------
  await prisma.student.upsert({
    where: { id: 'student-1' },
    update: {},
    create: {
      id: 'student-1',
      matricule: 'ALB-2024-001',
      dateOfBirth: new Date('2009-06-15'),
      gender: 'M',
      status: StudentStatus.ACTIVE,
      userId: 'user-student-1',
      schoolId: school.id,
    },
  });
  console.log('✅ Élève créé (table students séparée)');

  // ---------- PROFIL PARENT (table séparée) ----------
  await prisma.parent.upsert({
    where: { id: 'parent-1' },
    update: {},
    create: {
      id: 'parent-1',
      fullName: 'Karim El Amrani',
      phone: '+212600000001',
      email: 'parent@school.com',
      userId: 'user-parent-1',
    },
  });

  // Lier le parent à l'élève
  await prisma.student.update({
    where: { id: 'student-1' },
    data: { parentId: 'parent-1' },
  });
  console.log('✅ Parent créé et lié à l\'élève');

  // ---------- Classes ----------
  const classes = [
    { id: 'class-1', name: '6ème A', level: ClassLevel.MIDDLE_SCHOOL, room: '301', year: 'ay-2025-2026', teacher: 'teacher-1' },
    { id: 'class-2', name: '5ème A', level: ClassLevel.MIDDLE_SCHOOL, room: '302', year: 'ay-2025-2026', teacher: 'teacher-1' },
  ];
  for (const c of classes) {
    await prisma.class.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        level: c.level,
        roomNumber: c.room,
        academicYearId: c.year,
        classTeacherId: c.teacher,
      },
    });
  }
  console.log('✅ Classes créées:', classes.map((c) => c.name).join(', '));

  // ---------- Inscription élève → classe ----------
  await prisma.studentEnrollment.upsert({
    where: { id: 'enroll-1' },
    update: {},
    create: {
      id: 'enroll-1',
      studentId: 'student-1',
      classId: 'class-1',
      academicYearId: 'ay-2025-2026',
    },
  });
  console.log('✅ Inscription élève créée');

  // ---------- Affectation enseignant → classe → matière ----------
  await prisma.classAssignment.upsert({
    where: { id: 'assign-1' },
    update: {},
    create: {
      id: 'assign-1',
      subject: 'Mathématiques',
      teacherId: 'teacher-1',
      classId: 'class-1',
      academicYearId: 'ay-2025-2026',
    },
  });
  console.log('✅ Affectation enseignant créée');

  // ---------- Devoir exemple ----------
  await prisma.homework.upsert({
    where: { id: 'hw-1' },
    update: {},
    create: {
      id: 'hw-1',
      title: 'Devoir sur les fractions',
      description: 'Résoudre les exercices du chapitre 3',
      subject: 'Mathématiques',
      dueDate: new Date('2026-06-15'),
      classId: 'class-1',
      teacherId: 'teacher-1',
      academicYearId: 'ay-2025-2026',
    },
  });
  console.log('✅ Devoir exemple créé');

  // ---------- Note exemple ----------
  await prisma.studentGrade.upsert({
    where: { id: 'grade-1' },
    update: {},
    create: {
      id: 'grade-1',
      grade: 16,
      coefficient: 1,
      studentId: 'student-1',
      classId: 'class-1',
      teacherId: 'teacher-1',
      subject: 'Mathématiques',
      academicYearId: 'ay-2025-2026',
    },
  });
  console.log('✅ Note exemple créée');

  console.log('🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });