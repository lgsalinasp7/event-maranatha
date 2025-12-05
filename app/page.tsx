"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Send, Users, CheckCircle, Lock, Mail, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { MAX_ATTENDEES, loadRegistrations, generateQRData, generateSimpleQR, saveRegistrations } from '@/lib/event-utils';
import { RegistrationForm } from '@/components/event/registration-form';
import { Button } from '@/components/ui/button';
import type { FormData, FormErrors, RegistrationData } from '@/types/event';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    remaining: MAX_ATTENDEES,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    address: '',
    hasChildren: false,
    children: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para el login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    // Cargar estadísticas desde la API
    const loadStats = async () => {
      try {
        const response = await fetch('/api/registrations');
        if (response.ok) {
          const registrations = await response.json();
          setStats({
            remaining: MAX_ATTENDEES - registrations.length,
          });
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Fallback a localStorage si la API falla
        const registrations = loadRegistrations();
        setStats({
          remaining: MAX_ATTENDEES - registrations.length,
        });
      }
    };
    loadStats();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!email.trim()) {
      setLoginError('El correo electrónico es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setLoginError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (!password.trim()) {
      setLoginError('La contraseña es requerida');
      return;
    }

    setIsLoginLoading(true);
    const success = await login(email, password);

    if (!success) {
      setLoginError('Credenciales incorrectas. Por favor intenta de nuevo.');
      setIsLoginLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (stats.remaining <= 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Preparar datos para el QR (necesita id y timestamp temporal)
      const tempId = Date.now().toString();
      const tempTimestamp = Date.now();
      const qrData: Omit<RegistrationData, 'qrCode' | 'attended'> = {
        id: tempId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender as 'male' | 'female' | 'other',
        address: formData.address,
        hasChildren: formData.hasChildren,
        children: formData.children.map(child => ({
          id: child.id,
          name: child.name,
          gender: child.gender as 'male' | 'female',
          age: parseInt(child.age),
        })),
        timestamp: tempTimestamp,
      };
      const qrDataString = generateQRData(qrData);
      const qrCode = generateSimpleQR(qrDataString);

      // Enviar a la API
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          gender: formData.gender as 'male' | 'female' | 'other',
          address: formData.address,
          hasChildren: formData.hasChildren,
          children: formData.children.map(child => ({
            name: child.name,
            gender: child.gender as 'male' | 'female',
            age: parseInt(child.age),
          })),
          qrCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el registro');
      }

      const newRegistration = await response.json();
      
      // Guardar datos de éxito en sessionStorage para la página de éxito
      sessionStorage.setItem('successRegistration', JSON.stringify(newRegistration));
      
      // Actualizar estadísticas locales
      setStats(prev => ({
        remaining: prev.remaining - 1,
      }));
      
      router.push('/exito');
    } catch (error) {
      console.error('Error al guardar registro:', error);
      alert('Error al guardar el registro. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          // Vista de Login
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-4"
              >
                Bienvenido al Evento 2024
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                Inicia sesión para acceder al sistema de registro
              </motion.p>
            </div>

            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
              >
                <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Acceso al Sistema</h3>
                      <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="admin@maranatha.com"
                          disabled={isLoginLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                          disabled={isLoginLoading}
                        />
                      </div>
                    </div>

                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{loginError}</span>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoginLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                      {isLoginLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // Vista de Registro (después de autenticarse)
          <motion.div
            key="registration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          >
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 text-center"
              >
                Bienvenido al Evento 2024
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 text-center"
              >
                Registra tu asistencia y recibe tu código QR al instante
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold mb-8 mx-auto"
              >
                <Users className="w-5 h-5" />
                {stats.remaining} lugares disponibles de {MAX_ATTENDEES}
              </motion.div>
            </div>

            {stats.remaining > 0 ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid md:grid-cols-3 gap-8 mb-8"
                >
                  {/* Card con Formulario Integrado - Ocupa toda la primera fila */}
                  <div className="md:col-span-3 bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
                    <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900">Registro Rápido</h3>
                          <p className="text-gray-600">Completa tu registro en menos de 3 minutos</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <RegistrationForm
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        setErrors={setErrors}
                        currentStep={currentStep}
                        setCurrentStep={setCurrentStep}
                        onBack={() => {
                          if (currentStep === 1) {
                            // Reset form if on first step
                            setFormData({
                              firstName: '',
                              lastName: '',
                              phone: '',
                              gender: '',
                              address: '',
                              hasChildren: false,
                              children: [],
                            });
                            setCurrentStep(1);
                            setErrors({});
                          }
                        }}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Cards informativos en segunda fila */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                      <QrCode className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">QR Instantáneo</h3>
                    <p className="text-gray-600">Recibe tu código QR único al completar el registro</p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Envío por WhatsApp</h3>
                    <p className="text-gray-600">Tu QR será enviado directamente a tu WhatsApp</p>
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
              >
                <h2 className="text-3xl font-bold text-red-700 mb-4">Evento Lleno</h2>
                <p className="text-red-600 text-lg">
                  Lo sentimos, hemos alcanzado el límite de {MAX_ATTENDEES} asistentes registrados.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
