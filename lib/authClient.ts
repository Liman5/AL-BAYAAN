import { UserRole } from '@/types';

const ROLE_COOKIE = 'userRole';
const USER_ID_COOKIE = 'userId';

function buildCookie(name: string, value: string) {
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax;`;
}

export function setAuthCookies(role: UserRole, userId: string) {
  if (typeof document === 'undefined') return;
  document.cookie = buildCookie(ROLE_COOKIE, role);
  document.cookie = buildCookie(USER_ID_COOKIE, userId);
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Max-Age=0;`;
  document.cookie = `${USER_ID_COOKIE}=; Path=/; Max-Age=0;`;
}

export function getAuthRoleFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + ROLE_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) as UserRole : null;
}

export function getAuthUserIdFromCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + USER_ID_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
