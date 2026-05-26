import { LocalUser, SchoolClass, StudentProfile, Announcement, UserRole, UserStatus } from '@/types';

const STORAGE_KEY = 'school-management-local-db';

type LocalDatabase = {
  users: LocalUser[];
  students: StudentProfile[];
  classes: SchoolClass[];
  announcements: Announcement[];
};

const defaultData: LocalDatabase = {
  users: [
    {
      id: 'user-admin',
      email: 'admin@school.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'School',
      role: 'school_admin',
      status: 'Active',
      joined_at: new Date().toISOString(),
    },
    {
      id: 'user-teacher-1',
      email: 'teacher@school.com',
      password: 'teacher123',
      first_name: 'Imane',
      last_name: 'Mahmoud',
      role: 'teacher',
      status: 'Active',
      assigned_class: '5A',
      subjects: ['Mathématiques', 'Sciences'],
      joined_at: new Date().toISOString(),
    },
    {
      id: 'user-parent-1',
      email: 'parent@school.com',
      password: 'parent123',
      first_name: 'Karim',
      last_name: 'El Amrani',
      role: 'parent',
      status: 'Active',
      parent_for: ['student-local-1'],
      joined_at: new Date().toISOString(),
    },
    {
      id: 'user-student-1',
      email: 'student@school.com',
      password: 'student123',
      first_name: 'Youssef',
      last_name: 'Ait',
      role: 'student',
      status: 'Active',
      student_id: 'S-1001',
      assigned_class: '5A',
      joined_at: new Date().toISOString(),
    },
  ],
  students: [
    {
      request_id: 'req-1',
      student_id: 'S-1001',
      full_name: 'Youssef Ait',
      date_of_birth: '2009-06-15',
      gender: 'Male',
      parent_name: 'Karim El Amrani',
      parent_email: 'parent@school.com',
      phone: '+212600000001',
      address: 'Rabat, Maroc',
      class_name: '5A',
      academic_year: '2025/2026',
      profile_photo: '',
      registration_date: new Date().toISOString(),
      status: 'Active',
      login_email: 'student@school.com',
    },
  ],
  classes: [
    {
      id: 'class-5A',
      name: '5A',
      teacher_id: 'user-teacher-1',
      subject: 'Mathématiques',
      student_ids: ['user-student-1'],
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Rentrée scolaire',
      message: 'La rentrée aura lieu le 5 septembre. Préparez vos fournitures.',
      audience: 'student',
      class_name: '5A',
      created_at: new Date().toISOString(),
    },
    {
      id: 'ann-2',
      title: 'Réunion parents-professeurs',
      message: 'La réunion aura lieu le 20 octobre à 18h.',
      audience: 'parent',
      created_at: new Date().toISOString(),
    },
  ],
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDatabase(): LocalDatabase {
  if (!isBrowser()) {
    return defaultData;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }

  try {
    return JSON.parse(value) as LocalDatabase;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

function saveDatabase(db: LocalDatabase) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function getPendingStudentRegistrations(): StudentProfile[] {
  return getDatabase().students.filter((student) => student.status === 'Pending');
}

export function getActiveStudentProfiles(): StudentProfile[] {
  return getDatabase().students.filter((student) => student.status === 'Active');
}

export function getAllStudents(): StudentProfile[] {
  return getDatabase().students;
}

export function getUserByEmail(email: string) {
  return getDatabase().users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserById(id: string) {
  return getDatabase().users.find((user) => user.id === id) || null;
}

export function signInLocal(email: string, password: string) {
  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return { data: null, error: { message: 'E-mail ou mot de passe invalide.' } };
  }

  if (user.role === 'student' && user.status !== 'Active') {
    return { data: null, error: { message: 'Votre compte étudiant est en attente d’approbation.' } };
  }

  if (user.status === 'Suspended') {
    return { data: null, error: { message: 'Ce compte est suspendu. Contactez l’administration.' } };
  }

  return { data: { user }, error: null };
}

export function registerTeacherLocal(data: { first_name: string; last_name: string; email: string; password: string; subjects: string[]; assigned_class?: string }) {
  const db = getDatabase();
  if (getUserByEmail(data.email)) {
    return { success: false, message: 'Cette adresse e-mail est déjà utilisée.' };
  }

  const newUser: LocalUser = {
    id: createId('user'),
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    role: 'teacher',
    status: 'Active',
    assigned_class: data.assigned_class,
    subjects: data.subjects,
    joined_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabase(db);
  return { success: true, user: newUser };
}

export function registerParentLocal(data: { first_name: string; last_name: string; email: string; password: string; phone: string; parent_for?: string[] }) {
  const db = getDatabase();
  if (getUserByEmail(data.email)) {
    return { success: false, message: 'Cette adresse e-mail est déjà utilisée.' };
  }

  const newUser: LocalUser = {
    id: createId('user'),
    email: data.email,
    password: data.password,
    first_name: data.first_name,
    last_name: data.last_name,
    role: 'parent',
    status: 'Active',
    parent_for: data.parent_for || [],
    joined_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabase(db);
  return { success: true, user: newUser };
}

export function registerStudentRequest(data: Omit<StudentProfile, 'request_id' | 'registration_date' | 'status'> & { requested_password: string }) {
  const db = getDatabase();
  const loginEmail = data.login_email.trim().toLowerCase();
  if (db.users.some((user) => user.email.toLowerCase() === loginEmail)) {
    return { success: false, message: 'Cette adresse e-mail est déjà utilisée.' };
  }

  const newRequest: StudentProfile = {
    ...data,
    request_id: createId('req'),
    registration_date: new Date().toISOString(),
    status: 'Pending',
  };
  db.students.push(newRequest);
  saveDatabase(db);
  return { success: true, request: newRequest };
}

export function approveStudentRequest(requestId: string, password: string) {
  const db = getDatabase();
  const request = db.students.find((student) => student.request_id === requestId);
  if (!request) {
    return { success: false, message: 'Demande introuvable.' };
  }
  if (request.status !== 'Pending') {
    return { success: false, message: 'Cette demande a déjà été traitée.' };
  }

  const studentId = `S-${Math.floor(1000 + Math.random() * 9000)}`;
  request.status = 'Active';
  request.student_id = studentId;

  const newUser: LocalUser = {
    id: createId('user'),
    email: request.login_email,
    password: request.requested_password || password,
    first_name: request.full_name.split(' ')[0] ?? request.full_name,
    last_name: request.full_name.split(' ').slice(1).join(' ') ?? '',
    role: 'student',
    status: 'Active',
    student_id: studentId,
    assigned_class: request.class_name,
    joined_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDatabase(db);
  return { success: true, user: newUser, student: request };
}

export function getPendingCount() {
  return getPendingStudentRegistrations().length;
}

export function getAdminSummary() {
  const db = getDatabase();
  return {
    totalStudents: db.students.filter((student) => student.status === 'Active').length,
    totalPending: db.students.filter((student) => student.status === 'Pending').length,
    totalTeachers: db.users.filter((user) => user.role === 'teacher').length,
    totalParents: db.users.filter((user) => user.role === 'parent').length,
  };
}

export function getTeacherDashboardData(userId: string) {
  const db = getDatabase();
  const teacher = getUserById(userId);
  if (!teacher || teacher.role !== 'teacher') return null;
  const classes = db.classes.filter((cls) => cls.teacher_id === userId);
  const students = db.users.filter((user) => user.role === 'student' && classes.some((cls) => cls.student_ids.includes(user.id)));

  return {
    teacher,
    classes,
    studentCount: students.length,
    subjects: teacher.subjects || [],
  };
}

export function getStudentDashboardData(userId: string) {
  const user = getUserById(userId);
  if (!user || user.role !== 'student') return null;
  const db = getDatabase();
  const studentProfile = db.students.find((student) => student.login_email.toLowerCase() === user.email.toLowerCase() && student.status === 'Active');
  const announcements = db.announcements.filter((announcement) => announcement.audience === 'student' || announcement.class_name === user.assigned_class);

  return {
    student: user,
    profile: studentProfile,
    announcements,
  };
}

export function getParentDashboardData(userId: string) {
  const user = getUserById(userId);
  if (!user || user.role !== 'parent') return null;
  const db = getDatabase();
  const children = db.users.filter((child) => user.parent_for?.includes(child.id));
  const announcements = db.announcements.filter((announcement) => announcement.audience === 'parent');

  return {
    parent: user,
    children,
    announcements,
  };
}

export function getStudentRequestsForClass(className: string) {
  return getPendingStudentRegistrations().filter((student) => student.class_name === className);
}
