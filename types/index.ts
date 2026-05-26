export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

export type UserStatus = 'Pending' | 'Active' | 'Suspended';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  school_id?: string;
  phone?: string;
  avatar_url?: string;
}

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  student_id?: string;
  assigned_class?: string;
  subjects?: string[];
  parent_for?: string[];
  joined_at: string;
}

export interface StudentProfile {
  request_id: string;
  student_id?: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_email: string;
  phone: string;
  address: string;
  class_name: string;
  academic_year: string;
  profile_photo?: string;
  registration_date: string;
  status: UserStatus;
  login_email: string;
  requested_password?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacher_id: string;
  subject: string;
  student_ids: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'admin' | 'teacher' | 'student' | 'parent' | 'class';
  class_name?: string;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  address?: string;
}
