import React from 'react';
import { Class } from '@/types/admin';
import { Edit2, Trash2, Users, BookOpen } from 'lucide-react';

interface ClassListProps {
  classes: Class[];
  onEdit?: (classItem: Class) => void;
  onDelete?: (classId: string) => void;
  onClick?: (classItem: Class) => void;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  onEdit,
  onDelete,
  onClick,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((classItem) => (
        <div
          key={classItem.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onClick?.(classItem)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {classItem.level === 'primary'
                  ? 'Primaire'
                  : classItem.level === 'middle_school'
                    ? 'Collège'
                    : 'Lycée'}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <Users size={16} />
                Élèves
              </span>
              <span className="font-bold text-gray-900">{classItem.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Année Scolaire</span>
              <span className="font-bold text-gray-900">{classItem.academicYear}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(classItem);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg font-medium transition-colors"
              >
                <Edit2 size={18} />
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(classItem.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ClassDetailProps {
  classItem: Class;
  studentCount?: number;
  teacherCount?: number;
  onBack?: () => void;
}

export const ClassDetail: React.FC<ClassDetailProps> = ({
  classItem,
  studentCount = 0,
  teacherCount = 0,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Retour
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-900">{classItem.name}</h2>
        <div className="text-right">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
            {classItem.level === 'primary'
              ? 'Primaire'
              : classItem.level === 'middle_school'
                ? 'Collège'
                : 'Lycée'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Élèves</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{classItem.totalStudents}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Enseignants</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{teacherCount}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Année Scolaire</p>
          <p className="text-lg font-bold text-purple-600 mt-1">{classItem.academicYear}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-xs font-semibold text-gray-600 uppercase">Date Création</p>
          <p className="text-sm font-bold text-orange-600 mt-1">
            {classItem.createdAt.toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-4">Informations Supplémentaires</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-800">Niveau:</span>{' '}
            {classItem.level === 'primary'
              ? 'Enseignement Primaire'
              : classItem.level === 'middle_school'
                ? 'Enseignement Moyen'
                : 'Enseignement Secondaire'}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Identifiant Classe:</span> {classItem.id}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Dernière Modification:</span>{' '}
            {classItem.updatedAt.toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
};
