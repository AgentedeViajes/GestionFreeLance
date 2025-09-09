import React, { useState } from 'react';
import { Currency } from '../../types';
import type { Payment } from '../../types';

interface PaymentFormProps {
  bookingId: string;
  onSubmit: (bookingId: string, payment: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>(Currency.ARS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Explicitly convert `amount` to a number for comparison to fix type error.
    if (Number(amount) > 0) {
      onSubmit(bookingId, { amount: Number(amount), currency, date: new Date().toISOString() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-grow">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Monto del Pago</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Moneda</label>
          <select
            id="currency"
            value={currency}
            onChange={e => setCurrency(e.target.value as Currency)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value={Currency.ARS}>ARS</option>
            <option value={Currency.USD}>USD</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Registrar Pago</button>
      </div>
    </form>
  );
};

export default PaymentForm;