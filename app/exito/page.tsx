"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle, Download, Send } from 'lucide-react';
import type { RegistrationData } from '@/types/event';

export default function ExitoPage() {
  const router = useRouter();
  const [successData, setSuccessData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('successRegistration');
    if (stored) {
      setSuccessData(JSON.parse(stored));
      sessionStorage.removeItem('successRegistration');
    } else {
      router.push('/');
    }
  }, [router]);

  if (!successData) {
    return null;
  }

  const downloadQR = () => {
    if (!successData?.qrCode) return;
    const link = document.createElement('a');
    link.download = `qr-${successData.firstName}-${successData.lastName}.png`;
    link.href = successData.qrCode;
    link.click();
  };

  const simulateWhatsApp = () => {
    const message = `¡Registro confirmado para ${successData?.firstName} ${successData?.lastName}! Tu código QR está listo. Número: ${successData?.phone}`;
    alert(`WhatsApp (simulado): ${message}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Muchas gracias por su registro!</h2>
          <p className="text-gray-600 mb-8">Tu código QR ha sido generado exitosamente</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={successData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="space-y-2 text-left">
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Nombre:</span> {successData.firstName}{' '}
                {successData.lastName}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">Teléfono:</span> {successData.phone}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-gray-700">ID:</span> {successData.id}
              </p>
              {successData.hasChildren && (
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">Niños:</span> {successData.children.length}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar QR
            </button>
            <button
              onClick={simulateWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              Enviar WhatsApp
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-6 text-purple-600 hover:text-purple-700 font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}

