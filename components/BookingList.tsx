import React from 'react';
import type { Booking, Item } from '../types';
import BookingItem from './BookingItem';

interface BookingListProps {
  bookings: Booking[];
  selectedBookings: Set<string>;
  onSelectBooking: (bookingId: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  onDeleteItem: (bookingId: string, itemId: string) => void;
  onOpenItemForm: (bookingId: string, item?: Item | null) => void;
  onOpenPaymentForm: (bookingId: string) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onGeneratePDF: (booking: Booking) => void;
}

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  selectedBookings,
  onSelectBooking,
  onDeleteBooking,
  onDeleteItem,
  onOpenItemForm,
  onOpenPaymentForm,
  onSelectAll,
  onGeneratePDF,
  isAllSelected
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-gray-700">No hay reservas</h2>
        <p className="text-gray-500 mt-2">Cree una nueva reserva para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center p-4 bg-gray-50 border-b">
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={onSelectAll}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div className="ml-4 font-semibold text-gray-600 uppercase tracking-wider text-sm flex-1">
          <span>Reserva</span>
        </div>
        <div className="font-semibold text-gray-600 uppercase tracking-wider text-sm w-48 text-right">
          <span>Saldos Pendientes</span>
        </div>
        <div className="w-24"></div>
      </div>
      <ul className="divide-y divide-gray-200">
        {bookings.map(booking => (
          <BookingItem
            key={booking.id}
            booking={booking}
            isSelected={selectedBookings.has(booking.id)}
            onSelect={onSelectBooking}
            onDeleteBooking={onDeleteBooking}
            onDeleteItem={onDeleteItem}
            onOpenItemForm={onOpenItemForm}
            onOpenPaymentForm={onOpenPaymentForm}
            onGeneratePDF={onGeneratePDF}
          />
        ))}
      </ul>
    </div>
  );
};

export default BookingList;
