"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2 } from 'lucide-react';
import type { FormData, FormErrors } from '@/types/event';
import { validatePhone } from '@/lib/event-utils';

interface RegistrationFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RegistrationForm({
  formData,
  setFormData,
  errors,
  setErrors,
  currentStep,
  setCurrentStep,
  onBack,
  onSubmit,
  isSubmitting,
}: RegistrationFormProps) {
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Nombre es requerido';
      if (!formData.lastName.trim()) newErrors.lastName = 'Apellido es requerido';
      if (!formData.phone.trim()) {
        newErrors.phone = 'Celular es requerido';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'celular equivocado';
      }
      if (!formData.gender) newErrors.gender = 'Seleccione un género';
    }
    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    }
    if (step === 3 && formData.hasChildren) {
      if (formData.children.length === 0) {
        newErrors.hasChildren = 'Debe agregar al menos un niño';
      } else {
        const childErrors: Array<{
          name?: string;
          gender?: string;
          age?: string;
        }> = [];
        formData.children.forEach((child, idx) => {
          const childError: {
            name?: string;
            gender?: string;
            age?: string;
          } = {};
          if (!child.name.trim()) childError.name = 'Nombre requerido';
          if (!child.gender) childError.gender = 'Género requerido';
          if (!child.age || parseInt(child.age) < 0 || parseInt(child.age) > 18) {
            childError.age = 'Edad inválida (0-18)';
          }
          if (Object.keys(childError).length > 0) {
            childErrors[idx] = childError;
          }
        });
        if (childErrors.length > 0) {
          newErrors.children = childErrors;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [
        ...prev.children,
        {
          id: Date.now().toString(),
          name: '',
          gender: '',
          age: '',
        },
      ],
    }));
  };

  const removeChild = (id: string) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id),
    }));
  };

  const updateChild = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.id === id
          ? {
              ...child,
              [field]: value,
            }
          : child
      ),
    }));
  };

  return (
    <div className="bg-transparent rounded-3xl p-0 border-0 shadow-none">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Formulario de Registro</h2>
          <span className="text-sm font-medium text-gray-500">Paso {currentStep} de 3</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e =>
                  setFormData({
                    ...formData,
                    firstName: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e =>
                  setFormData({
                    ...formData,
                    lastName: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu apellido"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Celular *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => {
                  // Solo permitir números, máximo 10 dígitos
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({
                    ...formData,
                    phone: value,
                  });
                }}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="3001234567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Género *</label>
              <select
                value={formData.gender}
                onChange={e =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as 'male' | 'female' | 'other' | '',
                  })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.gender ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar género</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección *</label>
              <textarea
                value={formData.address}
                onChange={e =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu dirección completa"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">¿Tiene niños? *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.hasChildren === true}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        hasChildren: true,
                      })
                    }
                    className="w-5 h-5 text-purple-600"
                  />
                  <span className="text-gray-700">Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.hasChildren === false}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        hasChildren: false,
                        children: [],
                      })
                    }
                    className="w-5 h-5 text-purple-600"
                  />
                  <span className="text-gray-700">No</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {formData.hasChildren ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Información de Niños</h3>
                  <button
                    onClick={addChild}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Niño
                  </button>
                </div>

                {errors.hasChildren && <p className="text-sm text-red-500">{errors.hasChildren}</p>}

                {formData.children.map((child, idx) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">Niño {idx + 1}</span>
                      <button
                        onClick={() => removeChild(child.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Niño *</label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={e => updateChild(child.id, 'name', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.children?.[idx]?.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nombre"
                      />
                      {errors.children?.[idx]?.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.children[idx].name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                        <select
                          value={child.gender}
                          onChange={e => updateChild(child.id, 'gender', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.children?.[idx]?.gender ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Seleccionar</option>
                          <option value="male">Masculino</option>
                          <option value="female">Femenino</option>
                        </select>
                        {errors.children?.[idx]?.gender && (
                          <p className="mt-1 text-sm text-red-500">{errors.children[idx].gender}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Edad *</label>
                        <input
                          type="number"
                          value={child.age}
                          onChange={e => updateChild(child.id, 'age', e.target.value)}
                          min="0"
                          max="18"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.children?.[idx]?.age ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Edad"
                        />
                        {errors.children?.[idx]?.age && (
                          <p className="mt-1 text-sm text-red-500">{errors.children[idx].age}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {formData.children.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay niños agregados. Haz clic en "Agregar Niño" para comenzar.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Todo listo!</h3>
                <p className="text-gray-600">Tu registro está completo. Haz clic en "Completar Registro" para finalizar.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
        <button
          onClick={() => (currentStep === 1 ? onBack() : handleBack())}
          className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {currentStep === 1 ? 'Volver' : 'Anterior'}
        </button>

        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors"
          >
            Siguiente
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg font-medium transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Completar Registro
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

