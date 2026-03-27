import { HiQrcode, HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';

const statusConfig = {
  active: { label: 'Activo', icon: HiCheckCircle, className: 'badge-success' },
  pending: { label: 'Pendiente', icon: HiClock, className: 'badge bg-yellow-50 text-yellow-700' },
  cancelled: { label: 'Cancelado', icon: HiXCircle, className: 'badge-danger' },
  used: { label: 'Usado', icon: HiCheckCircle, className: 'badge bg-gray-100 text-gray-600' },
};

const typeColors = {
  general: 'from-primary-600 to-primary-800',
  premium: 'from-accent-500 to-accent-700',
  vip: 'from-yellow-500 to-amber-600',
};

export default function TicketCard({ ticket, compact = false }) {
  if (!ticket) return null;

  const status = statusConfig[ticket.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const gradientClass = typeColors[ticket.type?.toLowerCase()] || typeColors.general;

  return (
    <div className="card overflow-hidden">
      {/* Top colored band */}
      <div className={clsx('bg-gradient-to-r p-4 sm:p-6 text-white', gradientClass)}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-xs uppercase tracking-wider font-medium">CONEIC 2027</p>
            <h3 className="text-xl sm:text-2xl font-display font-bold mt-1 capitalize">
              {ticket.type_name || ticket.type || 'Entrada'}
            </h3>
          </div>
          <div className={clsx(status.className, '!bg-white/20 !text-white')}>
            <StatusIcon className="w-3.5 h-3.5 mr-1" />
            {status.label}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {!compact && ticket.qr_code && (
          <div className="flex justify-center mb-5">
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <QRCodeSVG
                value={ticket.qr_code}
                size={160}
                bgColor="#ffffff"
                fgColor="#1A3A6B"
                level="H"
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {ticket.purchase_code && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Codigo de compra</span>
              <span className="text-sm font-mono font-bold text-primary">{ticket.purchase_code}</span>
            </div>
          )}
          {ticket.holder_name && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Titular</span>
              <span className="text-sm font-medium text-gray-900">{ticket.holder_name}</span>
            </div>
          )}
          {ticket.purchase_date && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-gray-200">
              <span className="text-sm text-gray-500">Fecha de compra</span>
              <span className="text-sm text-gray-700">{ticket.purchase_date}</span>
            </div>
          )}
          {ticket.price !== undefined && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Precio</span>
              <span className="text-lg font-bold text-primary">S/ {ticket.price}</span>
            </div>
          )}
        </div>

        {compact && ticket.qr_code && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-700 cursor-pointer">
            <HiQrcode className="w-5 h-5" />
            <span className="font-medium">Ver codigo QR</span>
          </div>
        )}
      </div>
    </div>
  );
}
