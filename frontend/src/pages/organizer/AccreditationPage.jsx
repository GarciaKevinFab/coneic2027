import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { HiCheckCircle, HiXCircle, HiQrcode, HiRefresh } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import QRScanner from '../../components/QRScanner';

export default function AccreditationPage() {
  const [scanResult, setScanResult] = useState(null);
  const [scanActive, setScanActive] = useState(true);

  const accreditMutation = useMutation({
    mutationFn: adminService.accredit,
    onSuccess: (data) => {
      setScanResult({
        success: true,
        participant: data.participant || data,
        message: data.message || 'Acreditacion exitosa',
      });
      toast.success('Participante acreditado exitosamente');
    },
    onError: (error) => {
      const msg = error.response?.data?.detail || 'Error al acreditar';
      setScanResult({
        success: false,
        message: msg,
      });
      toast.error(msg);
    },
  });

  const handleScan = useCallback(
    (code) => {
      if (accreditMutation.isPending) return;
      setScanActive(false);
      accreditMutation.mutate(code);
    },
    [accreditMutation]
  );

  const handleScanError = useCallback((errorMsg) => {
    console.error('QR scan error:', errorMsg);
  }, []);

  const resetScan = () => {
    setScanResult(null);
    setScanActive(true);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Acreditacion
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Escanea el codigo QR del participante para acreditarlo
        </p>
      </div>

      {/* QR Scanner */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiQrcode className="w-5 h-5 text-[#1A3A6B]" />
            <h2 className="font-display font-bold text-gray-900">
              Escaner QR
            </h2>
          </div>
          {!scanActive && (
            <button
              onClick={resetScan}
              className="inline-flex items-center gap-1.5 text-sm text-[#1A3A6B] font-medium hover:text-[#15305a] transition-colors"
            >
              <HiRefresh className="w-4 h-4" />
              Escanear otro
            </button>
          )}
        </div>

        {scanActive ? (
          <QRScanner
            onScan={handleScan}
            onError={handleScanError}
            active={scanActive}
          />
        ) : (
          <div className="bg-gray-100 rounded-2xl aspect-square max-w-sm mx-auto flex items-center justify-center">
            <div className="text-center p-6">
              {accreditMutation.isPending ? (
                <>
                  <div className="w-12 h-12 border-4 border-[#1A3A6B]/20 border-t-[#1A3A6B] rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    Procesando acreditacion...
                  </p>
                </>
              ) : (
                <>
                  <HiQrcode className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Escaner pausado</p>
                  <button
                    onClick={resetScan}
                    className="mt-3 inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
                  >
                    Escanear de nuevo
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div className="animate-fade-in">
          {scanResult.success ? (
            <div className="card border-2 border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <HiCheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-green-800 text-lg">
                    Acreditacion exitosa
                  </h3>
                  <p className="text-green-700 text-sm mt-1">
                    {scanResult.message}
                  </p>

                  {scanResult.participant && (
                    <div className="mt-4 space-y-2">
                      {scanResult.participant.full_name && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Nombre</span>
                          <span className="font-medium text-green-800">
                            {scanResult.participant.full_name}
                          </span>
                        </div>
                      )}
                      {scanResult.participant.university && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Universidad</span>
                          <span className="font-medium text-green-800">
                            {scanResult.participant.university}
                          </span>
                        </div>
                      )}
                      {scanResult.participant.ticket_type && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Entrada</span>
                          <span className="font-medium text-green-800 capitalize">
                            {scanResult.participant.ticket_type}
                          </span>
                        </div>
                      )}
                      {scanResult.participant.status && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Estado</span>
                          <span className="font-medium text-green-800 capitalize">
                            {scanResult.participant.status}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={resetScan}
                className="w-full mt-5 inline-flex items-center justify-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                <HiQrcode className="w-4 h-4" />
                Escanear siguiente participante
              </button>
            </div>
          ) : (
            <div className="card border-2 border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <HiXCircle className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-red-800 text-lg">
                    Error de acreditacion
                  </h3>
                  <p className="text-red-700 text-sm mt-1">
                    {scanResult.message}
                  </p>
                </div>
              </div>

              <button
                onClick={resetScan}
                className="w-full mt-5 inline-flex items-center justify-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm"
              >
                <HiRefresh className="w-4 h-4" />
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
