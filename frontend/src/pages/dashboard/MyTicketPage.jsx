import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiDownload, HiShoppingCart, HiTicket } from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import ticketService from '../../services/ticketService';
import TicketCard from '../../components/TicketCard';
import QRDisplay from '../../components/QRDisplay';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyTicketPage() {
  const hasTicket = useAuthStore((state) => state.hasTicket);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-ticket'],
    queryFn: ticketService.getMyTicket,
    enabled: hasTicket(),
    retry: 1,
  });

  const handleDownloadReceipt = async () => {
    if (!ticket?.id) return;
    try {
      const response = await ticketService.getReceipt(ticket.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-coneic-${ticket.purchase_code || ticket.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Recibo descargado');
    } catch {
      toast.error('Error al descargar el recibo');
    }
  };

  if (!hasTicket()) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-[#F4A524]/10 flex items-center justify-center mx-auto mb-6">
          <HiShoppingCart className="w-10 h-10 text-[#F4A524]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
          No tienes una entrada
        </h1>
        <p className="text-gray-500 mb-6">
          Adquiere tu entrada para participar en el CONEIC 2027 y acceder a todas las actividades.
        </p>
        <Link
          to="/dashboard/comprar"
          className="inline-flex items-center gap-2 bg-[#F4A524] hover:bg-[#e09520] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <HiTicket className="w-5 h-5" />
          Comprar Entrada
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Cargando tu entrada..." className="py-20" />;
  }

  if (isError || !ticket) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-gray-500">Error al cargar tu entrada. Intenta de nuevo mas tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">Mi Entrada</h1>
        <p className="text-gray-500 mt-1 text-sm">Tu entrada digital para CONEIC 2027</p>
      </div>

      {/* Ticket Card */}
      <div className="mb-8">
        <TicketCard ticket={ticket} />
      </div>

      {/* Large QR Display */}
      {ticket.qr_code && (
        <div className="card p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-display font-bold text-gray-900 text-center mb-6">
            Tu Codigo QR
          </h2>
          <QRDisplay
            value={ticket.qr_code}
            size={240}
            title="CONEIC 2027 - Mi Entrada"
          />
          <p className="text-center text-xs text-gray-400 mt-4">
            Presenta este codigo en la acreditacion para ingresar al evento
          </p>
        </div>
      )}

      {/* Ticket Details */}
      <div className="card p-5 sm:p-6 mb-6">
        <h3 className="font-display font-bold text-gray-900 mb-4">Detalles de la entrada</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
            <span className="text-sm text-gray-500">Tipo de entrada</span>
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {ticket.type_name || ticket.type || '--'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
            <span className="text-sm text-gray-500">Fecha de compra</span>
            <span className="text-sm text-gray-700">{ticket.purchase_date || '--'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
            <span className="text-sm text-gray-500">Estado</span>
            <span className={`text-sm font-medium capitalize ${
              ticket.status === 'active' ? 'text-green-600' :
              ticket.status === 'pending' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              {ticket.status === 'active' ? 'Activo' :
               ticket.status === 'pending' ? 'Pendiente' :
               ticket.status === 'cancelled' ? 'Cancelado' :
               ticket.status || '--'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">Precio pagado</span>
            <span className="text-sm font-bold text-[#1A3A6B]">
              S/ {ticket.price ?? '--'}
            </span>
          </div>
        </div>
      </div>

      {/* Download Receipt */}
      <button
        onClick={handleDownloadReceipt}
        className="w-full card p-4 flex items-center justify-center gap-3 text-[#1A3A6B] hover:bg-[#1A3A6B]/5 transition-colors font-semibold"
      >
        <HiDownload className="w-5 h-5" />
        Descargar Recibo
      </button>
    </div>
  );
}
