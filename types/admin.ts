export type ClassLevel = 'preschool' | 'primary' | 'middle_school' | 'high_school';
export type AcademicYear = string; // Format: "2024-2025"
export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'inactive' | 'pending';
export type TeacherStatus = 'pending' | 'active' | 'on_leave' | 'inactive' | 'suspended';

export interface Class {
  id: string;
  name: string;
  level: ClassLevel;
  academicYear: AcademicYear;
  classTeacherId?: string;
  totalStudents: number;
  createdAt: Date;
  updatedAt: Date;
  // Données relationnelles enrichies (depuis Supabase)
  academic_year_id?: string;
  room_number?: string;
  description?: string;
  teacher_profiles?: any;
  class_assignments?: ClassAssignment[] | any[];
  student_enrollments?: any[];
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  parentName?: string;
  parentEmail?: string;
  matricule: string;
  classId: string;
  className: string;
  status: StudentStatus;
  dateOfBirth?: Date;
  registrationDate: Date;
  address?: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subjects: string[];
  classAssignments: ClassAssignment[];
  status: TeacherStatus;
  hireDate: Date;
  gender?: 'M' | 'F' | string;
  specializations?: string[];
  notes?: string;
}

export interface ClassAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subject: string;
  academicYear: AcademicYear;
  startDate: Date;
  endDate?: Date;
}

export interface StudentGradeReport {
  studentId: string;
  studentName: string;
  matricule: string;
  classId: string;
  className: string;
  subjects: SubjectGrade[];
  term: 'first' | 'second' | 'third' | 'final';
  academicYear: AcademicYear;
  generalAverage?: number;
  generalRemark?: string;
  printedAt?: Date;
  principalSignature?: string;
  teacherSignature?: string;
}

export interface SubjectGrade {
  subjectName: string;
  teacherName: string;
  classAssignments: number | null;
  homework: number | null;
  continuousAssessment: number | null;
  finalExam: number | null;
  average: number;
  coefficient: number;
  remark: string;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  activeStudents: number;
  activeTeachers: number;
}
