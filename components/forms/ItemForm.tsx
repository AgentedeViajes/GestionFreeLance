import React, { useState } from 'react';
import { Currency } from '../../types';
import type { Item } from '../../types';

interface ItemFormProps {
  bookingId: string;
  item: Item | null;
  onSubmit: (bookingId: string, item: Omit<Item, 'id'>) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ bookingId, item, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const [value, setValue] = useState(item?.value || '');
  const [currency, setCurrency] = useState<Currency>(item?.currency || Currency.ARS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Explicitly convert `value` to a number before comparison to fix type error.
    if (name && Number(value) > 0) {
      onSubmit(bookingId, { name, value: Number(value), currency });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Servicio</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-grow">
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor</label>
          <input
            type="number"
            id="value"
            value={value}
            onChange={e => setValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
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
        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Guardar</button>
      </div>
    </form>
  );
};

export default ItemForm;