export type RegistrationData = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  hasChildren: boolean;
  children: Array<{
    id: string;
    name: string;
    gender: 'male' | 'female';
    age: number;
  }>;
  qrCode: string;
  timestamp: number;
  attended: boolean;
};

export type FormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  address?: string;
  hasChildren?: string;
  children?: Array<{
    name?: string;
    gender?: string;
    age?: string;
  }>;
};

export type ViewMode = 'landing' | 'form' | 'success' | 'scan' | 'dashboard';

export type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | '';
  address: string;
  hasChildren: boolean;
  children: Array<{
    id: string;
    name: string;
    gender: 'male' | 'female' | '';
    age: string;
  }>;
};

