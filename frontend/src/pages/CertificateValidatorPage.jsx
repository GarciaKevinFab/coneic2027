import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { HiSearch, HiCheckCircle, HiXCircle, HiDocumentText } from 'react-icons/hi';
import certificateService from '../services/certificateService';

export default function CertificateValidatorPage() {
  const { code: urlCode } = useParams();
  const [code, setCode] = useState(urlCode || '');
  const [result, setResult] = useState(null);

  const mutation = useMutation({
    mutationFn: (validationCode) => certificateService.validate(validationCode),
    onSuccess: (data) => {
      setResult({ valid: true, data });
    },
    onError: () => {
      setResult({ valid: false });
    },
  });

  // Auto-validate if code comes from URL param
  useEffect(() => {
    if (urlCode) {
      setCode(urlCode);
      mutation.mutate(urlCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setResult(null);
    mutation.mutate(code.trim());
  };

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Validar Certificado
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Verifica la autenticidad de un certificado CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="w-14 h-14 rounded-xl bg-[#1A3A6B]/10 flex items-center justify-center mx-auto mb-6">
              <HiDocumentText className="w-7 h-7 text-[#1A3A6B]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Codigo del certificado
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (result) setResult(null);
                    }}
                    placeholder="Ej: CONEIC-2027-XXXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]/20 focus:border-[#1A3A6B] transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={mutation.isPending || !code.trim()}
                className="w-full py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Validando...' : 'Validar certificado'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="mt-8">
                {result.valid ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <HiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-green-800 text-lg mb-4">
                      Certificado valido
                    </h3>
                    <div className="space-y-2 text-sm text-green-700 text-left">
                      {result.data?.participant_name && (
                        <div className="flex justify-between py-2 border-b border-green-200">
                          <span className="font-medium">Participante</span>
                          <span>{result.data.participant_name}</span>
                        </div>
                      )}
                      {result.data?.type_label && (
                        <div className="flex justify-between py-2 border-b border-green-200">
                          <span className="font-medium">Tipo</span>
                          <span>{result.data.type_label}</span>
                        </div>
                      )}
                      {result.data?.workshop_name && (
                        <div className="flex justify-between py-2 border-b border-green-200">
                          <span className="font-medium">Taller</span>
                          <span>{result.data.workshop_name}</span>
                        </div>
                      )}
                      {result.data?.issued_date && (
                        <div className="flex justify-between py-2 border-b border-green-200">
                          <span className="font-medium">Fecha de emision</span>
                          <span>{result.data.issued_date}</span>
                        </div>
                      )}
                      {result.data?.code && (
                        <div className="flex justify-between py-2">
                          <span className="font-medium">Codigo</span>
                          <span className="font-mono">{result.data.code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <HiXCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-red-800 text-lg mb-2">
                      Certificado no encontrado
                    </h3>
                    <p className="text-sm text-red-600">
                      El codigo ingresado no corresponde a ningun certificado valido.
                      Verifica el codigo e intenta nuevamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
