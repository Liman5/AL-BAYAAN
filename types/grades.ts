export type AcademicLevel = 'primary' | 'middle_school';
export type Term = 'first' | 'second' | 'third';
export type AssessmentType = 'class_assignments' | 'homework' | 'continuous_assessment' | 'final_exam';
export type TeacherRemark = 'Excellent' | 'Très Bon' | 'Bon' | 'Passable' | 'Acceptable' | 'Insuffisant';

export interface Student {
  id: string;
  name: string;
  matricule?: string;
}

export interface GradeEntry {
  studentId: string;
  studentName: string;
  classAssignments: number | null;
  homework: number | null;
  continuousAssessment: number | null;
  finalExam: number | null;
  coefficient?: number;
  average?: number;
  remark?: TeacherRemark;
  teacherSignature?: string;
  teacherComments?: string;
}

export interface TermGrades {
  term: Term;
  assessmentType: AssessmentType;
  grades: GradeEntry[];
}

export interface GradingConfig {
  academicLevel: AcademicLevel;
  schoolName: string;
  subject: string;
  className: string;
  classAssignmentsCoefficient: number;
  homeworkCoefficient: number;
  continuousAssessmentCoefficient: number;
  finalExamCoefficient: number;
  maxScore: number; // Usually 20
  passingScore: number;
  excellentThreshold: number;
  veryGoodThreshold: number;
  goodThreshold: number;
  fairThreshold: number;
  passThreshold: number;
}

export interface GradeStats {
  average: number;
  min: number;
  max: number;
  evaluated: number;
  total: number;
}
