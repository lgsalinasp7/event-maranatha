"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, CheckCircle } from 'lucide-react';
import type { RegistrationData } from '@/types/event';
import { loadRegistrations, saveRegistrations } from '@/lib/event-utils';

export default function EscanearPage() {
  const [scannedCode, setScannedCode] = useState<string>('');
  const [scannedData, setScannedData] = useState<RegistrationData | null>(null);

  const handleScan = () => {
    if (!scannedCode) return;
    try {
      const decoded = JSON.parse(atob(scannedCode));
      const registrations = loadRegistrations();
      const found = registrations.find(r => r.id === decoded.id);
      if (found) {
        const updated = registrations.map(r =>
          r.id === found.id
            ? {
                ...r,
                attended: true,
              }
            : r
        );
        saveRegistrations(updated);
        setScannedData({
          ...found,
          attended: true,
        });
        setScannedCode('');
      } else {
        alert('QR no válido o no encontrado');
      }
    } catch (error) {
      alert('Error al escanear el código QR');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scan className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Escanear QR</h2>
            <p className="text-gray-600">Ingresa el código QR para marcar asistencia</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código QR</label>
              <input
                type="text"
                value={scannedCode}
                onChange={e => setScannedCode(e.target.value)}
                placeholder="Pega el código aquí..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleScan();
                  }
                }}
              />
            </div>

            <button
              onClick={handleScan}
              disabled={!scannedCode}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verificar y Marcar Asistencia
            </button>

            {scannedData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Asistencia Confirmada</h3>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  <p>
                    <span className="font-semibold">Nombre:</span> {scannedData.firstName} {scannedData.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">Teléfono:</span> {scannedData.phone}
                  </p>
                  {scannedData.hasChildren && (
                    <p>
                      <span className="font-semibold">Niños:</span> {scannedData.children.length}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

