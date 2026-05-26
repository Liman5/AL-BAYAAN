export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

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

export interface School {
  id: string;
  name: string;
  slug: string;
  address?: string;
}
