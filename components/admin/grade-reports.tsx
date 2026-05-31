import React from 'react';
import { StudentGradeReport, SubjectGrade } from '@/types/admin';
import { Download, Printer, FileText, BarChart3 } from 'lucide-react';

interface GradeReportProps {
  report: StudentGradeReport;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const GradeReport: React.FC<GradeReportProps> = ({
  report,
  onPrint,
  onDownload,
}) => {
  const calculateTermAverage = (subjects: SubjectGrade[]) => {
    if (subjects.length === 0) return 0;
    const totalWeightedGrades = subjects.reduce(
      (sum, subject) => sum + subject.average * subject.coefficient,
      0
    );
    const totalCoefficients = subjects.reduce((sum, subject) => sum + subject.coefficient, 0);
    return totalWeightedGrades / totalCoefficients;
  };

  const termAverage = calculateTermAverage(report.subjects);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg print:shadow-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 print:bg-white print:text-gray-900 print:border-b print:border-gray-300">
        <div className="max-w-6xl mx-auto flex justify-between items-start print:block">
          <div>
            <h1 className="text-3xl font-bold mb-2">ALBAYANE</h1>
            <p className="text-blue-100 print:text-gray-600">Établissement d'Enseignement Moderne</p>
          </div>
          <div className="text-right print:text-left print:mt-4">
            <p className="text-lg font-semibold">Bulletin de Notes</p>
            <p className="text-blue-100 print:text-gray-600">
              {report.term === 'first'
                ? '1er Trimestre'
                : report.term === 'second'
                  ? '2e Trimestre'
                  : report.term === 'third'
                    ? '3e Trimestre'
                    : 'Notes Finales'}{' '}
              {report.academicYear}
            </p>
          </div>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-8 bg-gray-50 print:bg-white print:p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom & Prénom</p>
            <p className="text-lg font-bold text-gray-900">{report.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matricule</p>
            <p className="text-lg font-bold text-gray-900">{report.matricule}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Classe</p>
            <p className="text-lg font-bold text-gray-900">{report.className}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Année Scolaire</p>
            <p className="text-lg font-bold text-gray-900">{report.academicYear}</p>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="p-8 print:p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 border border-gray-300">
                  Matière
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300">
                  Enseignant
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300 print:hidden">
                  Devoirs
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300 print:hidden">
                  Travaux
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300 print:hidden">
                  Contrôle
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300 print:hidden">
                  Examen
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300">
                  Moyenne
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900 border border-gray-300">
                  Appréciation
                </th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((subject, idx) => (
                <tr key={idx} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 border border-gray-300">
                    {subject.subjectName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border border-gray-300 text-center">
                    {subject.teacherName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-center print:hidden">
                    {subject.classAssignments ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-center print:hidden">
                    {subject.homework ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-center print:hidden">
                    {subject.continuousAssessment ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border border-gray-300 text-center print:hidden">
                    {subject.finalExam ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white bg-blue-600 border border-gray-300 text-center">
                    {subject.average.toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-semibold border border-gray-300 text-center ${
                      subject.remark === 'Excellent' || subject.remark === 'Très Bon'
                        ? 'bg-green-50 text-green-700'
                        : subject.remark === 'Bon'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-orange-50 text-orange-700'
                    }`}
                  >
                    {subject.remark}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-8 print:mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Moyenne Générale</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{termAverage.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Sujets Évalués</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{report.subjects.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Meilleure Note</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {Math.max(...report.subjects.map((s) => s.average)).toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Note Basse</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {Math.min(...report.subjects.map((s) => s.average)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Comments and Signatures */}
        <div className="mt-8 print:mt-6 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-2">Appréciation Générale</p>
            <p className="text-gray-600 leading-relaxed">
              {report.generalRemark || 'Veuillez maintenir votre engagement et continuer à progresser dans vos études.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 print:gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-12 print:mb-8">
                Signature de l'Enseignant
              </p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-12 print:mb-8">
                Signature du Directeur
              </p>
              <div className="border-t-2 border-gray-400 pt-2">
                <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end print:hidden">
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer size={18} />
            Imprimer
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Télécharger PDF
          </button>
        )}
      </div>
    </div>
  );
};

interface GradeReportsListProps {
  reports: StudentGradeReport[];
  onViewReport?: (report: StudentGradeReport) => void;
  searchQuery?: string;
  classFilter?: string;
  termFilter?: string;
}

export const GradeReportsList: React.FC<GradeReportsListProps> = ({
  reports,
  onViewReport,
  searchQuery = '',
  classFilter,
  termFilter,
}) => {
  const filteredReports = reports
    .filter((r) => !classFilter || r.classId === classFilter)
    .filter((r) => !termFilter || r.term === termFilter)
    .filter(
      (r) =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (filteredReports.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileText className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-500 text-lg">Aucun rapport de notes trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredReports.map((report) => (
        <div
          key={`${report.studentId}-${report.term}`}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onViewReport?.(report)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{report.studentName}</h3>
              <p className="text-sm text-gray-600">{report.matricule}</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {report.term === 'first'
                ? '1er Trimestre'
                : report.term === 'second'
                  ? '2e Trimestre'
                  : report.term === 'third'
                    ? '3e Trimestre'
                    : 'Final'}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Classe:</span> {report.className}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Sujets:</span> {report.subjects.length}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Moyenne Générale</p>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  report.subjects.reduce((sum, s) => sum + s.average * s.coefficient, 0) /
                  report.subjects.reduce((sum, s) => sum + s.coefficient, 0)
                ).toFixed(2)}
              </p>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
              <FileText size={18} />
              Voir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
