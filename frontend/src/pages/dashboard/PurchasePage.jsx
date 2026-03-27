import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  HiTicket,
  HiAcademicCap,
  HiCreditCard,
  HiCheckCircle,
  HiArrowLeft,
  HiArrowRight,
  HiCheck,
} from 'react-icons/hi';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import ticketService from '../../services/ticketService';
import workshopService from '../../services/workshopService';
import paymentService from '../../services/paymentService';
import PaymentForm from '../../components/PaymentForm';
import LoadingSpinner from '../../components/LoadingSpinner';

const STEP_CONFIG = [
  { key: 'ticket', label: 'Entrada', icon: HiTicket },
  { key: 'workshops', label: 'Talleres', icon: HiAcademicCap },
  { key: 'payment', label: 'Pago', icon: HiCreditCard },
  { key: 'confirmation', label: 'Listo', icon: HiCheckCircle },
];

export default function PurchasePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedWorkshops, setSelectedWorkshops] = useState([]);

  // Fetch ticket types
  const { data: ticketTypes, isLoading: typesLoading } = useQuery({
    queryKey: ['ticket-types'],
    queryFn: ticketService.getTypes,
  });

  // Fetch available workshops
  const { data: workshops, isLoading: workshopsLoading } = useQuery({
    queryKey: ['all-workshops'],
    queryFn: workshopService.getAll,
    enabled: step >= 1,
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (paymentData) => {
      let paymentResult;
      if (paymentData.method === 'culqi') {
        paymentResult = await paymentService.chargeCulqi({
          ...paymentData,
          ticket_type_id: selectedType.id,
          amount: selectedType.price,
        });
      } else {
        paymentResult = await paymentService.chargeYape({
          ...paymentData,
          ticket_type_id: selectedType.id,
          amount: selectedType.price,
        });
      }

      const ticket = await ticketService.purchase({
        ticket_type_id: selectedType.id,
        workshop_ids: selectedWorkshops,
        payment_id: paymentResult.payment_id,
      });

      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ticket'] });
      queryClient.invalidateQueries({ queryKey: ['my-workshops'] });
      setStep(3);
      toast.success('Compra exitosa');
    },
    onError: (error) => {
      const msg = error.response?.data?.detail || 'Error al procesar el pago';
      toast.error(msg);
    },
  });

  const maxWorkshops = selectedType?.max_workshop_slots || 0;
  const includesWorkshops = maxWorkshops > 0;

  const handleToggleWorkshop = (workshopId) => {
    setSelectedWorkshops((prev) => {
      if (prev.includes(workshopId)) {
        return prev.filter((id) => id !== workshopId);
      }
      if (prev.length >= maxWorkshops) {
        toast.error(`Maximo ${maxWorkshops} talleres permitidos`);
        return prev;
      }
      return [...prev, workshopId];
    });
  };

  const handlePaymentSubmit = (paymentData) => {
    purchaseMutation.mutate(paymentData);
  };

  const canAdvance = () => {
    if (step === 0) return !!selectedType;
    if (step === 1) return true;
    return false;
  };

  const nextStep = () => {
    if (step === 0 && !includesWorkshops) {
      setStep(2);
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const prevStep = () => {
    if (step === 2 && !includesWorkshops) {
      setStep(0);
    } else {
      setStep((s) => Math.max(s - 1, 0));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
          Comprar Entrada
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Sigue los pasos para adquirir tu entrada</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEP_CONFIG.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div
                      className={clsx(
                        'flex-1 h-0.5 transition-colors',
                        isComplete || isActive ? 'bg-[#1A3A6B]' : 'bg-gray-200'
                      )}
                    />
                  )}
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                      isActive
                        ? 'bg-[#1A3A6B] text-white shadow-lg shadow-[#1A3A6B]/20'
                        : isComplete
                          ? 'bg-[#1A3A6B] text-white'
                          : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {isComplete ? (
                      <HiCheck className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {i < STEP_CONFIG.length - 1 && (
                    <div
                      className={clsx(
                        'flex-1 h-0.5 transition-colors',
                        isComplete ? 'bg-[#1A3A6B]' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
                <span
                  className={clsx(
                    'text-xs mt-2 font-medium',
                    isActive
                      ? 'text-[#1A3A6B]'
                      : isComplete
                        ? 'text-[#1A3A6B]/70'
                        : 'text-gray-400'
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select ticket type */}
      {step === 0 && (
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-4">
            Selecciona tu tipo de entrada
          </h2>
          {typesLoading ? (
            <LoadingSpinner size="md" label="Cargando tipos..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(ticketTypes || []).map((type) => {
                const isSelected = selectedType?.id === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={clsx(
                      'card p-5 text-left transition-all',
                      isSelected
                        ? 'ring-2 ring-[#1A3A6B] bg-[#1A3A6B]/5 shadow-md'
                        : 'hover:shadow-md'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display font-bold text-gray-900 capitalize">
                        {type.name}
                      </h3>
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          isSelected ? 'border-[#1A3A6B] bg-[#1A3A6B]' : 'border-gray-300'
                        )}
                      >
                        {isSelected && <HiCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-500 mb-3">{type.description}</p>
                    )}
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-display font-bold text-[#1A3A6B]">
                        S/ {type.price}
                      </p>
                      {type.max_workshop_slots > 0 && (
                        <span className="text-xs bg-[#F4A524]/10 text-[#F4A524] font-medium px-2 py-1 rounded-lg">
                          {type.max_workshop_slots} talleres incluidos
                        </span>
                      )}
                    </div>
                    {type.features && (
                      <ul className="mt-4 space-y-1.5">
                        {type.features.map((feat, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                            <HiCheck className="w-4 h-4 text-green-500 shrink-0" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select workshops */}
      {step === 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900">
              Selecciona tus talleres
            </h2>
            <span className="text-sm font-medium text-[#1A3A6B] bg-[#1A3A6B]/10 px-3 py-1 rounded-full">
              {selectedWorkshops.length} / {maxWorkshops}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Tu entrada incluye hasta {maxWorkshops} talleres. Selecciona los que mas te interesen.
          </p>

          {workshopsLoading ? (
            <LoadingSpinner size="md" label="Cargando talleres..." />
          ) : (
            <div className="space-y-3">
              {(workshops || []).map((ws) => {
                const isChecked = selectedWorkshops.includes(ws.id);
                const isFull = ws.enrolled_count >= ws.max_capacity;
                const isDisabled =
                  !isChecked && (selectedWorkshops.length >= maxWorkshops || isFull);

                return (
                  <label
                    key={ws.id}
                    className={clsx(
                      'card p-4 flex items-start gap-4 cursor-pointer transition-all',
                      isChecked ? 'ring-2 ring-[#1A3A6B] bg-[#1A3A6B]/5' : '',
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => handleToggleWorkshop(ws.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1A3A6B] focus:ring-[#1A3A6B] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{ws.name}</h4>
                      {ws.speaker_name && (
                        <p className="text-xs text-gray-500 mt-0.5">{ws.speaker_name}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        {ws.time && <span>{ws.time}</span>}
                        {ws.location && <span>{ws.location}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={clsx(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        )}
                      >
                        {isFull ? 'Lleno' : `${ws.enrolled_count}/${ws.max_capacity}`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-2">Pago</h2>
          <p className="text-sm text-gray-500 mb-6">
            Completa el pago para confirmar tu entrada
          </p>

          {/* Order Summary */}
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Resumen de compra</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Entrada {selectedType?.name}</span>
                <span className="font-medium text-gray-900">S/ {selectedType?.price}</span>
              </div>
              {selectedWorkshops.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Talleres ({selectedWorkshops.length})
                  </span>
                  <span className="text-gray-500">Incluidos</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-[#1A3A6B] text-lg">
                  S/ {selectedType?.price?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <PaymentForm
            amount={selectedType?.price}
            onSubmit={handlePaymentSubmit}
            isLoading={purchaseMutation.isPending}
          />
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 3 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <HiCheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">
            Compra Exitosa
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Tu entrada ha sido adquirida correctamente. Puedes ver tu ticket y codigo QR en tu
            panel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard/mi-ticket')}
              className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <HiTicket className="w-5 h-5" />
              Ver Mi Entrada
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-[#1A3A6B] font-semibold py-3 px-6 rounded-xl hover:bg-[#1A3A6B]/5 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HiArrowLeft className="w-4 h-4" />
            Atras
          </button>
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-2 bg-[#1A3A6B] hover:bg-[#15305a] text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <HiArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <button
            onClick={prevStep}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Atras
          </button>
        </div>
      )}
    </div>
  );
}
