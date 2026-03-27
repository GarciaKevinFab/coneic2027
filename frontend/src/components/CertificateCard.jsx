import { HiDownload, HiAcademicCap, HiCalendar, HiDocumentText } from 'react-icons/hi';

const typeLabels = {
  attendance: 'Asistencia',
  workshop: 'Taller',
  speaker: 'Ponente',
  organizer: 'Organizador',
  competition: 'Concurso',
};

export default function CertificateCard({ certificate, onDownload, loading = false }) {
  if (!certificate) return null;

  return (
    <div className="card">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
            <HiAcademicCap className="w-6 h-6 text-accent-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-primary text-base truncate">
                  {certificate.title || 'Certificado CONEIC 2027'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 capitalize">
                  {typeLabels[certificate.type] || certificate.type || 'Certificado'}
                </p>
              </div>
              <span className="badge-success shrink-0">Emitido</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {certificate.issued_date && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <HiCalendar className="w-3.5 h-3.5" />
                  <span>{certificate.issued_date}</span>
                </div>
              )}
              {certificate.code && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <HiDocumentText className="w-3.5 h-3.5" />
                  <span className="font-mono">{certificate.code}</span>
                </div>
              )}
            </div>
            {onDownload && (
              <button
                onClick={() => onDownload(certificate.id)}
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary-50 text-primary hover:bg-primary-100 disabled:opacity-50"
              >
                <HiDownload className="w-4 h-4" />
                {loading ? 'Descargando...' : 'Descargar PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}