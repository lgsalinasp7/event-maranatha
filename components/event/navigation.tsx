"use client";

import { Calendar, Scan, BarChart3, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, admin, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-900">Registro de Evento</span>
          </Link>
          <div className="flex gap-2 items-center">
            <Link
              href="/"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/escanear"
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                pathname === '/escanear' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <Scan className="w-4 h-4" />
              Escanear
            </Link>
            {isAuthenticated && (
              <>
                {/* Solo mostrar dashboard si es administrador */}
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                      pathname === '/dashboard' ? 'text-purple-600' : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <span className="text-xs text-gray-500 hidden sm:inline">{admin?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

