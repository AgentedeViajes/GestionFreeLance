import React, { useState } from 'react';

interface BookingFormProps {
  onSubmit: (reservationNumber: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ onSubmit, onCancel }) => {
  const [reservationNumber, setReservationNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reservationNumber.trim()) {
      onSubmit(reservationNumber.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reservationNumber" className="block text-sm font-medium text-gray-700">Número de Reserva</label>
        <input
          type="text"
          id="reservationNumber"
          value={reservationNumber}
          onChange={e => setReservationNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Crear Reserva</button>
      </div>
    </form>
  );
};

export default BookingForm;