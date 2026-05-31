import React, { useState } from 'react';
import { Student } from '@/types/admin';
import { Edit2, Trash2, Eye, Plus, X, Check } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (studentId: string) => void;
  onView?: (student: Student) => void;
  classFilter?: string;
  searchQuery?: string;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onEdit,
  onDelete,
  onView,
  classFilter,
  searchQuery = '',
}) => {
  const filteredStudents = students
    .filter((s) => !classFilter || s.classId === classFilter)
    .filter(
      (s) =>
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (filteredStudents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun élève trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom Complet</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Matricule</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Classe</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{student.matricule}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{student.className}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{student.email || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {student.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center justify-center gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(student)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(student.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface StudentFormProps {
  student?: Student;
  onSubmit?: (student: Student) => void;
  onCancel?: () => void;
  availableClasses?: Array<{ id: string; name: string }>;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  availableClasses = [],
}) => {
  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      matricule: '',
      classId: '',
      className: '',
      status: 'active',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && formData.id) {
      onSubmit(formData as Student);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            placeholder="Prénom de l'élève"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            placeholder="Nom de famille"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="+213 555 123 456"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
          <select
            name="classId"
            value={formData.classId || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une classe</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Matricule</label>
          <input
            type="text"
            name="matricule"
            value={formData.matricule || ''}
            onChange={handleChange}
            placeholder="ALB-2024-001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom du parent</label>
          <input
            type="text"
            name="parentName"
            value={formData.parentName || ''}
            onChange={handleChange}
            placeholder="Nom du parent/tuteur"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone parent</label>
          <input
            type="tel"
            name="parentPhone"
            value={formData.parentPhone || ''}
            onChange={handleChange}
            placeholder="+213 555 111 111"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Check size={18} />
          Enregistrer
        </button>
      </div>
    </form>
  );
};
