import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiAcademicCap,
  HiDocumentText,
  HiRefresh,
  HiCheckCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import clsx from 'clsx';

const certificateTypes = [
  {
    id: 'attendance',
    label: 'Asistencia',
    description: 'Para todos los participantes acreditados',
  },
  {
    id: 'workshop',
    label: 'Talleres',
    description: 'Para participantes que completaron talleres',
  },
  {
    id: 'speaker',
    label: 'Ponentes',
    description: 'Para ponentes del evento',
  },
  {
    id: 'organizer',
    label: 'Organizadores',
    description: 'Para miembros del comite organizador',
  },
];

export default function GenerateCertificatesPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);

  const { data: certStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['admin-cert-status'],
    queryFn: adminService.getCertificateStatus,
    refetchInterval: 5000,
  });

  const generateMutation = useMutation({
    mutationFn: adminService.generateCertificates,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cert-status'] });
      const count = data.count || data.generated_count || 0;
      setGenerationResult({
        success: true,
        count,
        message: data.message || 'Certificados generados correctamente',
      });
      toast.success(`${count} certificados generados`);
    },
    onError: (error) => {
      const msg =
        error.response?.data?.detail || 'Error al generar certificados';
      setGenerationResult({
        success: false,
        message: msg,
      });
      toast.error(msg);
    },
  });

  const handleGenerate = () => {
    if (!selectedType) {
      toast.error('Selecciona un tipo de certificado');
      return;
    }
    setGenerationResult(null);
    generateMutation.mutate(selectedType);
  };

  const isGenerating = certStatus?.is_generating || generateMutation.isPending;

  const resetResult = () => {
    setGenerationResult(null);
    setSelectedType(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Generar Certificados
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Genera certificados en lote para los participantes del CONEIC 2027
        </p>
      </div>

      {/* Generation Status (in progress indicator) */}
      {certStatus && certStatus.is_generating && (
        <div className="card border-2 border-[#F4A524]/30 bg-[#F4A524]/5 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#F4A524]/30 border-t-[#F4A524] rounded-full animate-spin shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-800">
                Generando certificados...
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {certStatus.progress
                  ? `${certStatus.progress.current} de ${certStatus.progress.total} (${Math.round((certStatus.progress.current / certStatus.progress.total) * 100)}%)`
                  : 'Este proceso puede tomar varios minutos'}
              </p>
            </div>
          </div>
          {certStatus.progress && (
            <div className="mt-3 w-full h-2 bg-[#F4A524]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F4A524] rounded-full transition-all duration-500"
                style={{
                  width: `${(certStatus.progress.current / certStatus.progress.total) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Success/Error Result */}
      {generationResult && (
        <div className="mb-6 animate-fade-in">
          {generationResult.success ? (
            <div className="card border-2 border-green-200 bg-green-50 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <HiCheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-green-800 mb-1">
                Generacion Exitosa
              </h2>
              <p className="text-green-700 text-sm mb-3">
                {generationResult.message}
              </p>
              <p className="text-4xl font-display font-bold text-green-600 my-3">
                {generationResult.count}
              </p>
              <p className="text-sm text-green-600 mb-5">
                certificados generados
              </p>
              <button
                onClick={resetResult}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                <HiRefresh className="w-4 h-4" />
                Generar mas certificados
              </button>
            </div>
          ) : (
            <div className="card border-2 border-red-200 bg-red-50 p-6 text-center">
              <h3 className="font-display font-bold text-red-800 mb-2">
                Error al Generar
              </h3>
              <p className="text-red-700 text-sm mb-4">
                {generationResult.message}
              </p>
              <button
                onClick={resetResult}
                className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm"
              >
                <HiRefresh className="w-4 h-4" />
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Certificate Type Selection */}
      {!generationResult && (
        <>
          <div className="card p-5 sm:p-6 mb-6">
            <h2 className="font-display font-bold text-gray-900 mb-4">
              Tipo de certificado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certificateTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  disabled={isGenerating}
                  className={clsx(
                    'text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50',
                    selectedType === type.id
                      ? 'border-[#1A3A6B] bg-[#1A3A6B]/5'
                      : 'border-gray-200 hover:border-[#1A3A6B]/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        selectedType === type.id
                          ? 'bg-[#1A3A6B] text-white'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      <HiAcademicCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {type.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedType || isGenerating}
            className="w-full inline-flex items-center justify-center gap-3 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando certificados...
              </>
            ) : (
              <>
                <HiDocumentText className="w-5 h-5" />
                Generar Certificados
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-center text-sm text-gray-400 mt-3">
              Este proceso puede tardar unos minutos. No cierres esta pagina.
            </p>
          )}
        </>
      )}

      {/* Previous Generations */}
      {certStatus?.last_generations && certStatus.last_generations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display font-bold text-gray-900 mb-4">
            Generaciones anteriores
          </h2>
          <div className="space-y-3">
            {certStatus.last_generations.map((gen, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <HiCheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm capitalize">
                    Certificados de {gen.type}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {gen.count} certificados generados - {gen.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
