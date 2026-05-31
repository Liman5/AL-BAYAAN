import React, { useState } from 'react';
import { Teacher, ClassAssignment } from '@/types/admin';
import { Edit2, Trash2, Eye, Plus, Check, X } from 'lucide-react';

interface TeacherListProps {
  teachers: Teacher[];
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: string) => void;
  onView?: (teacher: Teacher) => void;
  searchQuery?: string;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onEdit,
  onDelete,
  onView,
  searchQuery = '',
}) => {
  const filteredTeachers = teachers.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredTeachers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun enseignant trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm -mx-4 sm:mx-0">
      <table className="w-full text-sm lg:text-base">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">Nom Complet</th>
            <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700 hidden md:table-cell">Email</th>
            <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700">Matières</th>
            <th className="px-3 lg:px-4 py-3 text-left text-xs lg:text-sm font-semibold text-gray-700 hidden sm:table-cell">Statut</th>
            <th className="px-3 lg:px-4 py-3 text-center text-xs lg:text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTeachers.map((teacher) => (
            <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 lg:px-4 py-3 text-sm lg:text-base font-medium text-gray-900">
                {teacher.firstName} {teacher.lastName}
              </td>
              <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-600 hidden md:table-cell">{teacher.email}</td>
              <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm text-gray-600">
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.slice(0, 2).map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                  {teacher.subjects.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{teacher.subjects.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm hidden sm:table-cell">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    teacher.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-3 lg:px-4 py-3 text-sm">
                <div className="flex items-center justify-center gap-1 lg:gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(teacher)}
                      className="p-1 lg:p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={16} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(teacher)}
                      className="p-1 lg:p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(teacher.id)}
                      className="p-1 lg:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} className="lg:w-[18px] lg:h-[18px]" />
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

interface TeacherFormProps {
  teacher?: Teacher;
  onSubmit?: (teacher: Teacher) => void;
  onCancel?: () => void;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Teacher>>(
    teacher || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subjects: [],
      status: 'active',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = (subject: string) => {
    if (subject && !formData.subjects?.includes(subject)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...(prev.subjects || []), subject],
      }));
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((s) => s !== subject),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && formData.id) {
      onSubmit(formData as Teacher);
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
            placeholder="Prénom de l'enseignant"
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
            placeholder="email@school.com"
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
            placeholder="+213 555 200 001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Matières enseignées</label>
        <div className="flex gap-2 mb-3">
          <select
            onChange={(e) => handleAddSubject(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Ajouter une matière</option>
            <option>Mathématiques</option>
            <option>Français</option>
            <option>Sciences Naturelles</option>
            <option>Anglais</option>
            <option>Histoire</option>
            <option>Géographie</option>
            <option>Éducation Physique</option>
          </select>
        </div>
        {formData.subjects && formData.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.subjects.map((subject) => (
              <span
                key={subject}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-2"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subject)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
        <select
          name="status"
          value={formData.status || 'active'}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Actif</option>
          <option value="on_leave">En Congé</option>
          <option value="inactive">Inactif</option>
        </select>
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
