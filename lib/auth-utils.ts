import type { AdminUser } from '@/types/auth';

// Lista hardcodeada de usuarios
// En producción, esto debería estar en una base de datos o variables de entorno
const ADMIN_USERS: AdminUser[] = [
  { email: 'admin@maranatha.com', password: 'admin123', role: 'admin' },
  { email: 'organizador@maranatha.com', password: 'org2024', role: 'organizer' },
  // Agregar más usuarios aquí según sea necesario
  // role: 'admin' = puede ver dashboard
  // role: 'organizer' = solo puede ver landing page
];

const SESSION_KEY = 'event_admin_session';

export const validateAdmin = (email: string, password: string): AdminUser | null => {
  const admin = ADMIN_USERS.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );
  return admin || null;
};

export const login = (email: string, password: string): boolean => {
  const admin = validateAdmin(email, password);
  if (admin) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: admin.email, timestamp: Date.now() }));
    }
    return true;
  }
  return false;
};

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    // Verificar que el email existe en la lista de administradores
    const admin = ADMIN_USERS.find(user => user.email === sessionData.email);
    return !!admin;
  } catch {
    return false;
  }
};

export const getCurrentAdmin = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const session = sessionStorage.getItem(SESSION_KEY);
  if (!session) return null;
  
  try {
    const sessionData = JSON.parse(session);
    return ADMIN_USERS.find(user => user.email === sessionData.email) || null;
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  const admin = getCurrentAdmin();
  return admin?.role === 'admin';
};

