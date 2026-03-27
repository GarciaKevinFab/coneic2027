import { useState } from 'react';
import { HiCreditCard, HiDeviceMobile } from 'react-icons/hi';
import clsx from 'clsx';

export default function PaymentForm({ amount, onSubmit, isLoading = false }) {
  const [method, setMethod] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    email: '',
  });
  const [yapePhone, setYapePhone] = useState('');

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === 'card') {
      onSubmit({ method: 'culqi', ...cardData });
    } else {
      onSubmit({ method: 'yape', phone: yapePhone });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount display */}
      <div className="bg-primary-50 rounded-xl p-4 text-center">
        <p className="text-sm text-primary-600 mb-1">Total a pagar</p>
        <p className="text-3xl font-display font-bold text-primary">
          S/ {Number(amount || 0).toFixed(2) || '0.00'}
        </p>
      </div>

      {/* Method selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod('card')}
          className={clsx(
            'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
            method === 'card'
              ? 'border-primary bg-primary-50 text-primary'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          <HiCreditCard className="w-5 h-5" />
          <span className="font-semibold text-sm">Tarjeta</span>
        </button>
        <button
          type="button"
          onClick={() => setMethod('yape')}
          className={clsx(
            'flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
            method === 'yape'
              ? 'border-purple-500 bg-purple-50 text-purple-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          <HiDeviceMobile className="w-5 h-5" />
          <span className="font-semibold text-sm">Yape</span>
        </button>
      </div>

      {/* Card form */}
      {method === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electronico
            </label>
            <input
              type="email"
              name="email"
              value={cardData.email}
              onChange={handleCardChange}
              placeholder="tu@email.com"
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numero de tarjeta
            </label>
            <input
              type="text"
              name="number"
              value={cardData.number}
              onChange={handleCardChange}
              placeholder="4111 1111 1111 1111"
              maxLength={19}
              required
              className="input-field font-mono"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mes</label>
              <input
                type="text"
                name="expMonth"
                value={cardData.expMonth}
                onChange={handleCardChange}
                placeholder="MM"
                maxLength={2}
                required
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ano</label>
              <input
                type="text"
                name="expYear"
                value={cardData.expYear}
                onChange={handleCardChange}
                placeholder="AA"
                maxLength={2}
                required
                className="input-field text-center"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
              <input
                type="text"
                name="cvv"
                value={cardData.cvv}
                onChange={handleCardChange}
                placeholder="123"
                maxLength={4}
                required
                className="input-field text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* Yape form */}
      {method === 'yape' && (
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-sm text-purple-700 mb-2">
              Ingresa tu numero de celular asociado a Yape
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numero de celular
            </label>
            <input
              type="tel"
              value={yapePhone}
              onChange={(e) => setYapePhone(e.target.value)}
              placeholder="999 999 999"
              maxLength={9}
              required
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={clsx(
          'w-full py-3.5 font-semibold rounded-xl text-white transition-all text-base',
          method === 'yape'
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-primary hover:bg-primary-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? 'Procesando pago...' : `Pagar S/ ${Number(amount || 0).toFixed(2) || '0.00'}`}
      </button>

      <p className="text-xs text-center text-gray-400">
        Pago procesado de forma segura por Culqi. Tus datos estan protegidos.
      </p>
    </form>
  );
}
