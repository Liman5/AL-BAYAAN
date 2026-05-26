'use client';

import { useMemo } from 'react';
import { roles } from '@/lib/constants';

export function useRoleGuard(userRole?: string) {
  return useMemo(() => {
    return {
      isSuperAdmin: userRole === roles.SUPER_ADMIN,
      isSchoolAdmin: userRole === roles.SCHOOL_ADMIN,
      isTeacher: userRole === roles.TEACHER,
      isStudent: userRole === roles.STUDENT,
      isParent: userRole === roles.PARENT,
    };
  }, [userRole]);
}
