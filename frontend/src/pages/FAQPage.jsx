import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi';
import institutionalService from '../services/institutionalService';
import LoadingSpinner from '../components/LoadingSpinner';
import clsx from 'clsx';

const fallbackFAQs = [
  {
    question: 'Cuando y donde se realizara CONEIC 2027?',
    answer: 'CONEIC 2027 se realizara del 15 al 20 de agosto de 2027 en la ciudad de Lima, Peru. La sede principal sera la Universidad Nacional de Ingenieria.',
  },
  {
    question: 'Quien puede participar en CONEIC 2027?',
    answer: 'CONEIC esta dirigido a estudiantes de ingenieria civil de universidades peruanas. Tambien pueden participar estudiantes de carreras afines y profesionales del sector.',
  },
  {
    question: 'Como puedo registrarme?',
    answer: 'Puedes registrarte creando una cuenta en nuestra plataforma. Luego, desde tu dashboard, podras comprar tu entrada y seleccionar los talleres de tu interes.',
  },
  {
    question: 'Cuales son los metodos de pago?',
    answer: 'Aceptamos pagos con tarjeta de credito/debito (Visa, Mastercard) y Yape. Todos los pagos son procesados de forma segura a traves de Culqi.',
  },
  {
    question: 'Puedo inscribirme en varios talleres?',
    answer: 'Si, dependiendo del tipo de entrada. Las entradas Premium permiten hasta 3 talleres y las VIP incluyen acceso a todos los talleres disponibles.',
  },
  {
    question: 'Se entregan certificados?',
    answer: 'Si, todos los participantes reciben certificado de asistencia al congreso. Adicionalmente, se entregan certificados por cada taller completado.',
  },
  {
    question: 'Puedo obtener un reembolso?',
    answer: 'Se permiten reembolsos hasta 30 dias antes del evento. Despues de esa fecha, se puede transferir la entrada a otra persona contactando al comite organizador.',
  },
  {
    question: 'Hay alojamiento incluido?',
    answer: 'Las entradas no incluyen alojamiento. Sin embargo, tenemos convenios con hoteles cercanos que ofrecen tarifas especiales para participantes del CONEIC.',
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
        <HiChevronDown
          className={clsx(
            'w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 animate-slide-down">
          <p className="text-gray-600 leading-relaxed text-sm">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faq'],
    queryFn: institutionalService.getFAQ,
    placeholderData: null,
  });

  const faqList = faqs || fallbackFAQs;

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            Resolvemos tus dudas sobre CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSpinner size="lg" className="py-16" />
          ) : (
            <div className="space-y-3">
              {faqList.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  item={faq}
                  isOpen={openIndex === idx}
                  onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                />
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-primary-50 rounded-2xl p-8">
            <HiQuestionMarkCircle className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
              No encontraste tu respuesta?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Contactanos y resolveremos tu duda lo antes posible
            </p>
            <a
              href="mailto:contacto@coneic2027.pe"
              className="btn-primary text-sm"
            >
              Enviar correo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
