import { GradeEntry, Term, AcademicLevel } from '@/types/grades';

const primaryStudents: GradeEntry[] = [
  {
    studentId: '1',
    studentName: 'Ahmed Benhamida',
    classAssignments: 18,
    homework: 17,
    continuousAssessment: 16,
    finalExam: 15,
  },
  {
    studentId: '2',
    studentName: 'Fatima Saïdi',
    classAssignments: 19,
    homework: 18,
    continuousAssessment: 17,
    finalExam: 18,
  },
  {
    studentId: '3',
    studentName: 'Mohamed Kadri',
    classAssignments: 14,
    homework: 13,
    continuousAssessment: 15,
    finalExam: 12,
  },
  {
    studentId: '4',
    studentName: 'Leila Ferrah',
    classAssignments: 16,
    homework: 15,
    continuousAssessment: 16,
    finalExam: 17,
  },
  {
    studentId: '5',
    studentName: 'Karim Bouassem',
    classAssignments: 12,
    homework: 11,
    continuousAssessment: 13,
    finalExam: 10,
  },
  {
    studentId: '6',
    studentName: 'Noor Belgacem',
    classAssignments: 17,
    homework: 16,
    continuousAssessment: 18,
    finalExam: 19,
  },
  {
    studentId: '7',
    studentName: 'Malik Zouaoui',
    classAssignments: 15,
    homework: 14,
    continuousAssessment: 14,
    finalExam: 13,
  },
  {
    studentId: '8',
    studentName: 'Hana Bensaid',
    classAssignments: 19,
    homework: 19,
    continuousAssessment: 18,
    finalExam: 20,
  },
];

const middleStudents: GradeEntry[] = [
  {
    studentId: '1',
    studentName: 'Amina Soudi',
    classAssignments: 17,
    homework: 16,
    continuousAssessment: 15,
    finalExam: 14,
  },
  {
    studentId: '2',
    studentName: 'Samir Mansour',
    classAssignments: 18,
    homework: 17,
    continuousAssessment: 18,
    finalExam: 17,
  },
  {
    studentId: '3',
    studentName: 'Yasmine Belhadj',
    classAssignments: 16,
    homework: 15,
    continuousAssessment: 16,
    finalExam: 15,
  },
  {
    studentId: '4',
    studentName: 'Rayan Hadj',
    classAssignments: 13,
    homework: 12,
    continuousAssessment: 14,
    finalExam: 11,
  },
  {
    studentId: '5',
    studentName: 'Zara Nedjah',
    classAssignments: 18,
    homework: 18,
    continuousAssessment: 17,
    finalExam: 19,
  },
  {
    studentId: '6',
    studentName: 'Omar Boudaoud',
    classAssignments: 14,
    homework: 13,
    continuousAssessment: 15,
    finalExam: 13,
  },
];

export const getMockGrades = (
  academicLevel: AcademicLevel,
  term: Term
): GradeEntry[] => {
  const students = academicLevel === 'primary' ? primaryStudents : middleStudents;
  
  // Add slight variations based on term for realism
  const termMultiplier = term === 'first' ? 1 : term === 'second' ? 1.05 : 1.1;
  
  return students.map(student => ({
    ...student,
    classAssignments: Math.min(20, Math.round(student.classAssignments! * termMultiplier)),
    homework: Math.min(20, Math.round(student.homework! * termMultiplier)),
    continuousAssessment: Math.min(20, Math.round(student.continuousAssessment! * termMultiplier)),
    finalExam: Math.min(20, Math.round(student.finalExam! * termMultiplier)),
  }));
};
