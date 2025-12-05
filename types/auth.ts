export type AdminUser = {
  email: string;
  password: string;
  role: 'admin' | 'organizer';
};

export type AuthState = {
  isAuthenticated: boolean;
  admin: AdminUser | null;
};

