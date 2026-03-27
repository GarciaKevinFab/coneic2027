import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiSearch, HiFilter, HiDownload, HiUserGroup } from 'react-icons/hi';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import clsx from 'clsx';

const ticketFilters = [
  { value: '', label: 'Todos los tipos' },
  { value: 'general', label: 'General' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
];

const paymentFilters = [
  { value: '', label: 'Todos los pagos' },
  { value: 'paid', label: 'Pagado' },
  { value: 'pending', label: 'Pendiente' },
];

const accreditedFilters = [
  { value: '', label: 'Acreditacion' },
  { value: 'true', label: 'Acreditado' },
  { value: 'false', label: 'No acreditado' },
];

export default function ParticipantsListPage() {
  const [search, setSearch] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [accredited, setAccredited] = useState('');
  const [exporting, setExporting] = useState(false);

  const params = {};
  if (search) params.search = search;
  if (ticketType) params.ticket_type = ticketType;
  if (paymentStatus) params.payment_status = paymentStatus;
  if (accredited) params.accredited = accredited;

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-participants', params],
    queryFn: () => adminService.getParticipants(params),
  });

  const participants = data?.participants || data || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await adminService.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'participantes-coneic2027.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Archivo exportado');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Participantes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {Array.isArray(participants) ? participants.length : 0} participantes registrados
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors disabled:opacity-50 text-sm"
        >
          <HiDownload className="w-4 h-4" />
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="input-field pl-9 !py-2.5 text-sm"
            />
          </div>
          <select
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            {ticketFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            {paymentFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <select
            value={accredited}
            onChange={(e) => setAccredited(e.target.value)}
            className="input-field !py-2.5 text-sm"
          >
            {accreditedFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando participantes..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar participantes. Intenta de nuevo.</p>
        </div>
      ) : participants.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Universidad</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Entrada</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pago</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Acreditado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {p.full_name || p.name || '--'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.email || '--'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{p.university || '--'}</td>
                    <td className="px-4 py-3">
                      <span className="badge-primary capitalize">{p.ticket_type || '--'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'badge',
                        p.payment_status === 'paid' ? 'badge-success' : 'bg-yellow-50 text-yellow-700'
                      )}>
                        {p.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'badge',
                        p.is_accredited ? 'badge-success' : 'bg-gray-100 text-gray-500'
                      )}>
                        {p.is_accredited ? 'Si' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <HiUserGroup className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg mb-2">Sin resultados</h3>
          <p className="text-gray-500 text-sm">No se encontraron participantes con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
