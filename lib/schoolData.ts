'use client';

// ============================================================
// Couche de données scolaire interconnectée
// Al Bayan - Année scolaire / Devoirs / Présences / Paiements
// ============================================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  date: string; // ISO date YYYY-MM-DD
  status: AttendanceStatus;
  academicYear: string;
  comment?: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  className: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  publishedDate: string;
  dueDate: string;
  academicYear: string;
  createdAt: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  academicYear: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid' | 'pending';
  transactions: PaymentTransaction[];
}

export interface TeacherPayment {
  id: string;
  teacherId: string;
  teacherName: string;
  academicYear: string;
  expectedSalary: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  transactions: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  date: string;
  reference: string;
  method: string;
  period?: string;
}

export interface StudentGradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  assignmentType: 'devoir' | 'interrogation' | 'examen';
  grade: number; // /20
  coefficient: number;
  date: string;
  homeworkId?: string;
  academicYear: string;
  createdAt: string;
}

// ---------- Stockage localStorage ----------
const SCHOOL_DATA_KEY = 'al-bayan-school-data';

const DEFAULT_ACADEMIC_YEARS = ['2024-2025', '2025-2026', '2026-2027'];
const CURRENT_ACADEMIC_YEAR = '2025-2026';

interface SchoolDataState {
  academicYears: string[];
  currentAcademicYear: string;
  attendance: AttendanceRecord[];
  homeworks: Homework[];
  studentPayments: StudentPayment[];
  teacherPayments: TeacherPayment[];
  studentGrades: StudentGradeRecord[];
}

const defaultState: SchoolDataState = {
  academicYears: DEFAULT_ACADEMIC_YEARS,
  currentAcademicYear: CURRENT_ACADEMIC_YEAR,
  attendance: [],
  homeworks: [],
  studentPayments: [],
  teacherPayments: [],
  studentGrades: [],
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getState(): SchoolDataState {
  if (!isBrowser()) return defaultState;
  const raw = window.localStorage.getItem(SCHOOL_DATA_KEY);
  if (!raw) return defaultState;
  try {
    return JSON.parse(raw) as SchoolDataState;
  } catch {
    return defaultState;
  }
}

function saveState(state: SchoolDataState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify(state));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- Année scolaire ----------
export function getAcademicYears(): string[] {
  return getState().academicYears;
}

export function getCurrentAcademicYear(): string {
  return getState().currentAcademicYear;
}

export function setCurrentAcademicYear(year: string) {
  const state = getState();
  state.currentAcademicYear = year;
  saveState(state);
}

// ---------- Appel / Présence ----------
export function getAttendanceForClass(classId: string, date: string): AttendanceRecord[] {
  return getState().attendance.filter(
    (record) => record.classId === classId && record.date === date
  );
}

export function getAttendanceForStudent(studentId: string, academicYear?: string): AttendanceRecord[] {
  const state = getState();
  return state.attendance.filter(
    (record) =>
      record.studentId === studentId &&
      (!academicYear || record.academicYear === academicYear)
  );
}

export function saveAttendanceForClass(
  classId: string,
  className: string,
  date: string,
  teacherId: string,
  teacherName: string,
  academicYear: string,
  entries: Array<{ studentId: string; studentName: string; status: AttendanceStatus; comment?: string }>
) {
  const state = getState();
  // Éviter les doublons : supprimer les appels existants pour (classe, date)
  state.attendance = state.attendance.filter(
    (record) => !(record.classId === classId && record.date === date)
  );
  entries.forEach((entry) => {
    state.attendance.push({
      id: createId('att'),
      studentId: entry.studentId,
      studentName: entry.studentName,
      classId,
      className,
      teacherId,
      teacherName,
      date,
      status: entry.status,
      comment: entry.comment,
      academicYear,
      createdAt: new Date().toISOString(),
    });
  });
  saveState(state);
  return { success: true };
}

export function getAttendanceSummaryForStudent(studentId: string, academicYear?: string) {
  const records = getAttendanceForStudent(studentId, academicYear);
  return {
    present: records.filter((r) => r.status === 'present').length,
    late: records.filter((r) => r.status === 'late').length,
    absent: records.filter((r) => r.status === 'absent').length,
    excused: records.filter((r) => r.status === 'excused').length,
    total: records.length,
    records,
  };
}

// ---------- Devoirs ----------
export function getHomeworksForClass(classId: string, academicYear?: string): Homework[] {
  const state = getState();
  return state.homeworks.filter(
    (h) => h.classId === classId && (!academicYear || h.academicYear === academicYear)
  );
}

export function getHomeworksForStudent(className: string, studentId: string, academicYear?: string): Homework[] {
  const state = getState();
  return state.homeworks.filter(
    (h) => h.className === className && (!academicYear || h.academicYear === academicYear)
  );
}

export function createHomework(data: Omit<Homework, 'id' | 'createdAt'>) {
  const state = getState();
  const newHomework: Homework = {
    ...data,
    id: createId('hw'),
    createdAt: new Date().toISOString(),
  };
  state.homeworks.push(newHomework);
  saveState(state);
  return { success: true, homework: newHomework };
}

// ---------- Notes élèves ----------
export function getGradesForStudent(studentId: string, academicYear?: string): StudentGradeRecord[] {
  const state = getState();
  return state.studentGrades.filter(
    (g) => g.studentId === studentId && (!academicYear || g.academicYear === academicYear)
  );
}

export function getGradesForClass(classId: string, academicYear?: string): StudentGradeRecord[] {
  const state = getState();
  return state.studentGrades.filter(
    (g) => g.classId === classId && (!academicYear || g.academicYear === academicYear)
  );
}

export function addStudentGrade(data: Omit<StudentGradeRecord, 'id' | 'createdAt'>) {
  const state = getState();
  const newGrade: StudentGradeRecord = {
    ...data,
    id: createId('grade'),
    createdAt: new Date().toISOString(),
  };
  state.studentGrades.push(newGrade);
  saveState(state);
  return { success: true, grade: newGrade };
}

export function getStudentAverage(studentId: string, subject?: string, academicYear?: string): number | null {
  const grades = getGradesForStudent(studentId, academicYear);
  const filtered = subject ? grades.filter((g) => g.subject === subject) : grades;
  if (filtered.length === 0) return null;
  const totalWeighted = filtered.reduce((acc, g) => acc + g.grade * g.coefficient, 0);
  const totalCoef = filtered.reduce((acc, g) => acc + g.coefficient, 0);
  return totalCoef > 0 ? Math.round((totalWeighted / totalCoef) * 10) / 10 : null;
}

// ---------- Paiements élèves ----------
export function getStudentPayments(academicYear?: string): StudentPayment[] {
  const state = getState();
  return state.studentPayments.filter((p) => !academicYear || p.academicYear === academicYear);
}

export function getStudentPaymentForStudent(studentId: string, academicYear?: string): StudentPayment | undefined {
  return getStudentPayments(academicYear).find((p) => p.studentId === studentId);
}

export function initializeStudentPayment(student: { id: string; name: string; matricule: string; className: string }, academicYear: string, totalAmount: number) {
  const state = getState();
  if (state.studentPayments.some((p) => p.studentId === student.id && p.academicYear === academicYear)) {
    return { success: false, message: 'Un dossier de paiement existe déjà pour cet élève.' };
  }
  state.studentPayments.push({
    id: createId('spay'),
    studentId: student.id,
    studentName: student.name,
    matricule: student.matricule,
    className: student.className,
    academicYear,
    totalAmount,
    paidAmount: 0,
    status: 'unpaid',
    transactions: [],
  });
  saveState(state);
  return { success: true };
}

export function recordStudentPayment(
  studentId: string,
  academicYear: string,
  amount: number,
  method: string = 'espèces',
  reference: string = ''
) {
  const state = getState();
  const payment = state.studentPayments.find(
    (p) => p.studentId === studentId && p.academicYear === academicYear
  );
  if (!payment) return { success: false, message: 'Dossier de paiement introuvable.' };

  const transaction: PaymentTransaction = {
    id: createId('txn'),
    amount,
    date: new Date().toISOString(),
    reference: reference || `PAY-${Date.now()}`,
    method,
  };
  payment.transactions.push(transaction);
  payment.paidAmount = payment.transactions.reduce((acc, txn) => acc + txn.amount, 0);
  payment.status =
    payment.paidAmount >= payment.totalAmount ? 'paid' : payment.paidAmount > 0 ? 'partial' : 'unpaid';
  saveState(state);
  return { success: true, payment };
}

export function getStudentPaymentStats(academicYear: string) {
  const payments = getStudentPayments(academicYear);
  return {
    totalExpected: payments.reduce((acc, p) => acc + p.totalAmount, 0),
    totalCollected: payments.reduce((acc, p) => acc + p.paidAmount, 0),
    totalRemaining: payments.reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0),
    fullyPaid: payments.filter((p) => p.status === 'paid').length,
    partiallyPaid: payments.filter((p) => p.status === 'partial').length,
    unpaid: payments.filter((p) => p.status === 'unpaid').length,
  };
}

// ---------- Paiements enseignants ----------
export function getTeacherPayments(academicYear?: string): TeacherPayment[] {
  const state = getState();
  return state.teacherPayments.filter((p) => !academicYear || p.academicYear === academicYear);
}

export function initializeTeacherPayment(teacher: { id: string; name: string }, academicYear: string, expectedSalary: number) {
  const state = getState();
  if (state.teacherPayments.some((p) => p.teacherId === teacher.id && p.academicYear === academicYear)) {
    return { success: false, message: 'Un dossier de rémunération existe déjà pour cet enseignant.' };
  }
  state.teacherPayments.push({
    id: createId('tpay'),
    teacherId: teacher.id,
    teacherName: teacher.name,
    academicYear,
    expectedSalary,
    paidAmount: 0,
    status: 'unpaid',
    transactions: [],
  });
  saveState(state);
  return { success: true };
}

export function recordTeacherPayment(
  teacherId: string,
  academicYear: string,
  amount: number,
  method: string = 'virement',
  reference: string = '',
  period?: string
) {
  const state = getState();
  const payment = state.teacherPayments.find(
    (p) => p.teacherId === teacherId && p.academicYear === academicYear
  );
  if (!payment) return { success: false, message: 'Dossier de rémunération introuvable.' };

  const transaction: PaymentTransaction = {
    id: createId('txn'),
    amount,
    date: new Date().toISOString(),
    reference: reference || `SAL-${Date.now()}`,
    method,
    period,
  };
  payment.transactions.push(transaction);
  payment.paidAmount = payment.transactions.reduce((acc, txn) => acc + txn.amount, 0);
  payment.status =
    payment.paidAmount >= payment.expectedSalary ? 'paid' : payment.paidAmount > 0 ? 'partial' : 'unpaid';
  saveState(state);
  return { success: true, payment };
}

export function getTeacherPaymentStats(academicYear: string) {
  const payments = getTeacherPayments(academicYear);
  return {
    totalTeachers: payments.length,
    totalExpected: payments.reduce((acc, p) => acc + p.expectedSalary, 0),
    totalPaid: payments.reduce((acc, p) => acc + p.paidAmount, 0),
    totalRemaining: payments.reduce((acc, p) => acc + (p.expectedSalary - p.paidAmount), 0),
    paid: payments.filter((p) => p.status === 'paid').length,
    partial: payments.filter((p) => p.status === 'partial').length,
    unpaid: payments.filter((p) => p.status === 'unpaid').length,
  };
}