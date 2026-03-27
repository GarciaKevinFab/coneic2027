import { useState } from 'react';
import { HiChevronDown, HiQuestionMarkCircle } from 'react-icons/hi';
import clsx from 'clsx';

const faqs = [
  {
    question: 'Cuando y donde se realizara CONEIC 2027?',
    answer:
      'CONEIC 2027 se realizara del 15 al 20 de agosto de 2027 en la ciudad de Huancayo, Junin - Peru. La sede principal sera la Universidad Nacional del Centro del Peru (UNCP).',
  },
  {
    question: 'Quien puede participar en CONEIC 2027?',
    answer:
      'CONEIC esta dirigido principalmente a estudiantes de ingenieria civil de universidades peruanas. Tambien pueden participar estudiantes de carreras afines, egresados y profesionales del sector de la construccion.',
  },
  {
    question: 'Como puedo registrarme para el evento?',
    answer:
      'Puedes registrarte creando una cuenta en nuestra plataforma web. Una vez registrado, verificaras tu correo electronico y desde tu dashboard podras comprar tu entrada y seleccionar los talleres de tu interes.',
  },
  {
    question: 'Cuales son los metodos de pago disponibles?',
    answer:
      'Aceptamos pagos con tarjeta de credito/debito (Visa, Mastercard), transferencia bancaria y Yape. Todos los pagos son procesados de forma segura. Recibiras un comprobante digital al completar tu compra.',
  },
  {
    question: 'Que tipos de entrada estan disponibles?',
    answer:
      'Ofrecemos tres tipos de entrada: Basico (S/150) con acceso a ponencias y certificado; Estandar (S/280) que incluye talleres, kit de bienvenida y eventos sociales; y Premium (S/400) con acceso total a talleres, cena de gala y merchandising exclusivo.',
  },
  {
    question: 'Puedo inscribirme en varios talleres?',
    answer:
      'Si, dependiendo del tipo de entrada. La entrada Basica no incluye talleres. La entrada Estandar permite inscribirte en 2 talleres practicos. La entrada Premium incluye acceso ilimitado a todos los talleres disponibles.',
  },
  {
    question: 'Se entregan certificados de participacion?',
    answer:
      'Si. Todos los participantes reciben un certificado digital de asistencia al congreso. Adicionalmente, se otorgan certificados por cada taller completado. Los certificados pueden ser verificados en nuestra plataforma con un codigo unico.',
  },
  {
    question: 'Puedo obtener un reembolso si no puedo asistir?',
    answer:
      'Se permiten reembolsos completos hasta 30 dias antes del inicio del evento. Entre 30 y 15 dias antes se realiza un reembolso del 50%. Despues de esa fecha, puedes transferir tu entrada a otra persona contactando al comite organizador.',
  },
  {
    question: 'Hay alojamiento incluido en la entrada?',
    answer:
      'Las entradas no incluyen alojamiento. Sin embargo, tenemos convenios con hoteles y hostales cercanos a la sede que ofrecen tarifas especiales para participantes del CONEIC. La informacion estara disponible en tu dashboard una vez compres tu entrada.',
  },
  {
    question: 'Como puedo contactar al comite organizador?',
    answer:
      'Puedes escribirnos a contacto@coneic2027.pe o a traves de nuestras redes sociales (Instagram, Facebook). Tambien puedes visitar la seccion de contacto en nuestra pagina web. El equipo responde en un plazo maximo de 48 horas.',
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
      <div
        className={clsx(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 pb-5">
          <p className="text-gray-600 leading-relaxed text-sm">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-[#1A3A6B] via-[#1A3A6B]/90 to-[#1A3A6B]/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Resolvemos tus dudas sobre CONEIC 2027
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                item={faq}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? -1 : idx)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-[#1A3A6B]/5 rounded-2xl p-8">
            <HiQuestionMarkCircle className="w-10 h-10 text-[#1A3A6B] mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-gray-900 mb-2">
              No encontraste tu respuesta?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Contactanos y resolveremos tu duda lo antes posible
            </p>
            <a
              href="mailto:contacto@coneic2027.pe"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#1A3A6B] text-white font-semibold text-sm hover:bg-[#1A3A6B]/90 transition-colors"
            >
              Enviar correo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
