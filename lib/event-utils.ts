import type { RegistrationData } from '@/types/event';

export const MAX_ATTENDEES = 500;

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

export const generateQRData = (data: Omit<RegistrationData, 'qrCode' | 'attended'>): string => {
  return btoa(JSON.stringify(data));
};

export const generateSimpleQR = (data: string): string => {
  const size = 200;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  const gridSize = 8;
  const cellSize = size / gridSize;
  for (let i = 0; i < data.length && i < gridSize * gridSize; i++) {
    const charCode = data.charCodeAt(i % data.length);
    if (charCode % 2 === 0) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
  return canvas.toDataURL();
};

export const loadRegistrations = (): RegistrationData[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('eventRegistrations');
  return stored ? JSON.parse(stored) : [];
};

export const saveRegistrations = (data: RegistrationData[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eventRegistrations', JSON.stringify(data));
};

export const exportToCSV = (registrations: RegistrationData[]): void => {
  const headers = ['ID', 'Nombre', 'Apellido', 'Teléfono', 'Género', 'Dirección', 'Tiene Niños', 'Niños', 'Asistió', 'Fecha'];
  const rows = registrations.map(r => [
    r.id,
    r.firstName,
    r.lastName,
    r.phone,
    r.gender,
    r.address,
    r.hasChildren ? 'Sí' : 'No',
    r.children.map(c => `${c.name} (${c.age})`).join('; '),
    r.attended ? 'Sí' : 'No',
    new Date(r.timestamp).toLocaleString()
  ]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `registros-evento-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

