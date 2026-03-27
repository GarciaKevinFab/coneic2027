import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiAcademicCap, HiDocumentText, HiRefresh, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import clsx from 'clsx';

const certificateTypes = [
  { id: 'attendance', label: 'Asistencia', description: 'Para todos los participantes acreditados' },
  { id: 'workshop', label: 'Talleres', description: 'Para participantes que completaron talleres' },
  { id: 'speaker', label: 'Ponentes', description: 'Para ponentes del evento' },
  { id: 'organizer', label: 'Organizadores', description: 'Para miembros del comite organizador' },
];

export default function GenerateCertificatesPage() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);

  const {
    data: certStatus,
    isLoading: loadingStatus,
  } = useQuery({
    queryKey: ['admin-cert-status'],
    queryFn: adminService.getCertificateStatus,
    refetchInterval: 5000,
  });

  const generateMutation = useMutation({
    mutationFn: adminService.generateCertificates,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cert-status'] });
      toast.success(data.message || 'Generacion de certificados iniciada');
    },
    onError: (error) => {
      const msg = error.response?.data?.detail || 'Error al generar certificados';
      toast.error(msg);
    },
  });

  const handleGenerate = () => {
    if (!selectedType) {
      toast.error('Selecciona un tipo de certificado');
      return;
    }
    if (!window.confirm(`Generar certificados de ${certificateTypes.find(t => t.id === selectedType)?.label}? Esta accion puede tomar varios minutos.`)) {
      return;
    }
    generateMutation.mutate(selectedType);
  };

  const isGenerating = certStatus?.is_generating || generateMutation.isPending;

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Generar Certificados
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Genera certificados en lote para los participantes del CONEIC 2027
        </p>
      </div>

      {/* Generation Status */}
      {certStatus && certStatus.is_generating && (
        <div className="card border-2 border-accent-200 bg-accent-50 p-5 mb-6 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-3 border-accent-200 border-t-accent rounded-full animate-spin shrink-0" />
            <div>
              <h3 className="font-semibold text-accent-800">Generando certificados...</h3>
              <p className="text-sm text-accent-600 mt-0.5">
                {certStatus.progress
                  ? `${certStatus.progress.current} de ${certStatus.progress.total} (${Math.round((certStatus.progress.current / certStatus.progress.total) * 100)}%)`
                  : 'Este proceso puede tomar varios minutos'}
              </p>
            </div>
          </div>
          {certStatus.progress && (
            <div className="mt-3 w-full h-2 bg-accent-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(certStatus.progress.current / certStatus.progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Certificate Type Selection */}
      <div className="card p-5 sm:p-6 mb-6">
        <h2 className="font-display font-bold text-gray-900 mb-4">Tipo de certificado</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certificateTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              disabled={isGenerating}
              className={clsx(
                'text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50',
                selectedType === type.id
                  ? 'border-primary bg-primary-50'
                  : 'border-gray-200 hover:border-primary-200'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  selectedType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                )}>
                  <HiAcademicCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{type.label}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
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
        className="btn-primary w-full !py-3.5 text-base"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <HiRefresh className="w-5 h-5 animate-spin" />
            Generando...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <HiDocumentText className="w-5 h-5" />
            Generar certificados
          </span>
        )}
      </button>

      {/* Previous Generations */}
      {certStatus?.last_generations && certStatus.last_generations.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display font-bold text-gray-900 mb-4">Generaciones anteriores</h2>
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
