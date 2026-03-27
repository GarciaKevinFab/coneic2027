import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';
import certificateService from '../../services/certificateService';
import CertificateCard from '../../components/CertificateCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CertificatesPage() {
  const [downloadingId, setDownloadingId] = useState(null);

  const {
    data: certificates,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: certificateService.getMyCerts,
  });

  const handleDownload = async (certId) => {
    setDownloadingId(certId);
    try {
      const response = await certificateService.download(certId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificado-coneic-${certId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificado descargado');
    } catch {
      toast.error('Error al descargar el certificado');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Mis Certificados
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Descarga tus certificados de participacion y talleres
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando certificados..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar certificados. Intenta de nuevo.</p>
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onDownload={handleDownload}
              isLoading={downloadingId === cert.id}
            />
          ))}
        </div>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1A3A6B]/5 flex items-center justify-center mx-auto mb-4">
            <HiAcademicCap className="w-8 h-8 text-[#1A3A6B]/40" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-2">
            Sin certificados disponibles
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Los certificados se generaran al finalizar el evento. Si ya completaste alguna
            actividad, espera a que el comite organizador los emita.
          </p>
        </div>
      )}
    </div>
  );
}
