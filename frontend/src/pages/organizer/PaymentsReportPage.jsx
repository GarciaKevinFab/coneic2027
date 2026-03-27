import { useQuery } from '@tanstack/react-query';
import { HiCurrencyDollar, HiCreditCard, HiDeviceMobile } from 'react-icons/hi';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import clsx from 'clsx';

const methodIcons = {
  culqi: HiCreditCard,
  card: HiCreditCard,
  yape: HiDeviceMobile,
};

const methodLabels = {
  culqi: 'Tarjeta',
  card: 'Tarjeta',
  yape: 'Yape',
};

export default function PaymentsReportPage() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminService.getPayments,
  });

  const payments = data?.payments || data || [];
  const summary = data?.summary || null;

  const totalRevenue =
    summary?.total_revenue ||
    payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCount = summary?.total_count || payments.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Reporte de Pagos
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Registro de todos los pagos procesados
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" label="Cargando pagos..." className="py-20" />
      ) : isError ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">Error al cargar los pagos. Intenta de nuevo.</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <HiCurrencyDollar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total recaudado</p>
                  <p className="text-xl font-display font-bold text-gray-900">
                    S/{' '}
                    {totalRevenue.toLocaleString('es-PE', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A3A6B]/10 flex items-center justify-center">
                  <HiCreditCard className="w-5 h-5 text-[#1A3A6B]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total pagos</p>
                  <p className="text-xl font-display font-bold text-gray-900">
                    {totalCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F4A524]/10 flex items-center justify-center">
                  <HiCurrencyDollar className="w-5 h-5 text-[#F4A524]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Promedio por pago</p>
                  <p className="text-xl font-display font-bold text-gray-900">
                    S/ {totalCount > 0 ? Number(totalRevenue / totalCount).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payments table */}
          {payments.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Fecha
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Participante
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Tipo Entrada
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Metodo
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">
                        Monto
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment, idx) => {
                      const MethodIcon =
                        methodIcons[payment.method] || HiCreditCard;
                      return (
                        <tr
                          key={payment.id || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {payment.date || payment.created_at || '--'}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {payment.participant_name || payment.user_name || payment.email || '--'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize text-gray-700">
                              {payment.ticket_type || '--'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MethodIcon className="w-4 h-4" />
                              <span>
                                {methodLabels[payment.method] ||
                                  payment.method ||
                                  '--'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                            S/ {Number(payment.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={clsx(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                payment.status === 'completed' ||
                                  payment.status === 'paid'
                                  ? 'bg-green-50 text-green-700'
                                  : payment.status === 'failed'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-yellow-50 text-yellow-700'
                              )}
                            >
                              {payment.status === 'completed' ||
                              payment.status === 'paid'
                                ? 'Completado'
                                : payment.status === 'failed'
                                  ? 'Fallido'
                                  : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Summary row */}
                  <tfoot>
                    <tr className="bg-[#1A3A6B]/5 border-t-2 border-[#1A3A6B]/20">
                      <td
                        colSpan={4}
                        className="px-4 py-3 font-display font-bold text-[#1A3A6B]"
                      >
                        Total ({totalCount} pagos)
                      </td>
                      <td className="px-4 py-3 text-right font-display font-bold text-[#1A3A6B] text-base">
                        S/{' '}
                        {totalRevenue.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-500">No hay pagos registrados aun.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
