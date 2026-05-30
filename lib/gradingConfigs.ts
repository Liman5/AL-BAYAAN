import { GradingConfig, AcademicLevel } from '@/types/grades';

export const primarySchoolConfig: GradingConfig = {
  academicLevel: 'primary',
  schoolName: 'AL-BAYAAN',
  subject: 'Mathématiques',
  className: '5e',
  classAssignmentsCoefficient: 0.2,
  homeworkCoefficient: 0.15,
  continuousAssessmentCoefficient: 0.25,
  finalExamCoefficient: 0.4,
  maxScore: 20,
  passingScore: 10,
  excellentThreshold: 18,
  veryGoodThreshold: 16,
  goodThreshold: 14,
  fairThreshold: 12,
  passThreshold: 10,
};

export const middleSchoolConfig: GradingConfig = {
  academicLevel: 'middle_school',
  schoolName: 'AL-BAYAAN',
  subject: 'Mathématiques',
  className: '3e',
  classAssignmentsCoefficient: 0.2,
  homeworkCoefficient: 0.15,
  continuousAssessmentCoefficient: 0.25,
  finalExamCoefficient: 0.4,
  maxScore: 20,
  passingScore: 10,
  excellentThreshold: 18,
  veryGoodThreshold: 16,
  goodThreshold: 14,
  fairThreshold: 12,
  passThreshold: 10,
};

export const getGradingConfig = (academicLevel: AcademicLevel): GradingConfig => {
  return academicLevel === 'primary' ? primarySchoolConfig : middleSchoolConfig;
};

export const getTeacherRemark = (average: number, config: GradingConfig) => {
  if (average >= config.excellentThreshold) return 'Excellent';
  if (average >= config.veryGoodThreshold) return 'Très Bon';
  if (average >= config.goodThreshold) return 'Bon';
  if (average >= config.fairThreshold) return 'Passable';
  if (average >= config.passThreshold) return 'Acceptable';
  return 'Insuffisant';
};

export const calculateAverage = (
  classAssignments: number | null,
  homework: number | null,
  continuousAssessment: number | null,
  finalExam: number | null,
  config: GradingConfig
): number | null => {
  const scores = [
    classAssignments !== null ? classAssignments * config.classAssignmentsCoefficient : 0,
    homework !== null ? homework * config.homeworkCoefficient : 0,
    continuousAssessment !== null ? continuousAssessment * config.continuousAssessmentCoefficient : 0,
    finalExam !== null ? finalExam * config.finalExamCoefficient : 0,
  ];

  const validScores = [
    classAssignments !== null ? config.classAssignmentsCoefficient : 0,
    homework !== null ? config.homeworkCoefficient : 0,
    continuousAssessment !== null ? config.continuousAssessmentCoefficient : 0,
    finalExam !== null ? config.finalExamCoefficient : 0,
  ];

  const totalCoefficient = validScores.reduce((a, b) => a + b, 0);
  if (totalCoefficient === 0) return null;

  const totalScore = scores.reduce((a, b) => a + b, 0);
  return Math.round((totalScore / totalCoefficient) * 100) / 100;
};
