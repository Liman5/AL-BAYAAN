export function getTeacherRoleLabel(gender?: string | null) {
  return gender === 'F' ? 'Enseignante' : 'Enseignant';
}
