import { useState } from 'react';
import { HiSearch, HiCheckCircle, HiXCircle, HiDocumentText } from 'react-icons/hi';
import certificateService from '../services/certificateService';
import toast from 'react-hot-toast';

export default function CertificateValidatorPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Ingresa un codigo de certificado');
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const data = await certificateService.validate(code.trim());
      setResult({ valid: true, data });
    } catch {
      setResult({ valid: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Validar Certificado
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Verifica la autenticidad de un certificado CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
              <HiDocumentText className="w-7 h-7 text-primary" />
            </div>

            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Codigo del certificado
                </label>
                <div className="relative">
                  <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ej: CONEIC-2027-XXXX"
                    className="input-field pl-10 font-mono"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3">
                {isLoading ? 'Validando...' : 'Validar certificado'}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="mt-8 animate-fade-in">
                {result.valid ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <HiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-display font-bold text-green-800 text-lg mb-2">
                      Certificado valido
                    </h3>
                    <div className="space-y-2 text-sm text-green-700">
                      {result.data?.participant_name && (
                        <p><span className="font-medium">Participante:</span> {result.data.participant_name}</p>
                      )}
                      {result.data?.type_label && (
                        <p><span className="font-medium">Tipo:</span> {result.data.type_label}</p>
                      )}
                      {result.data?.issued_date && (
                        <p><span className="font-medium">Emitido:</span> {result.data.issued_date}</p>
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
                      El codigo ingresado no corresponde a ningun certificado valido. Verifica el codigo e intenta nuevamente.
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
