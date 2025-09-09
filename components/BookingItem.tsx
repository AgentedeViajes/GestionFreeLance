import React, { useState, useMemo } from 'react';
// FIX: Use Currency enum instead of string literals. Import Currency as a value.
import { Currency, type Booking, type Item } from '../types';
import { calculateTotals } from '../utils/calculations';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, TrashIcon, PlusCircleIcon, DollarSignIcon, FileTextIcon } from './icons';

interface BookingItemProps {
  booking: Booking;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  onDeleteItem: (bookingId: string, itemId: string) => void;
  onOpenItemForm: (bookingId: string, item?: Item | null) => void;
  onOpenPaymentForm: (bookingId: string) => void;
  onGeneratePDF: (booking: Booking) => void;
}

const BookingItem: React.FC<BookingItemProps> = React.memo(({
  booking,
  isSelected,
  onSelect,
  onDeleteBooking,
  onDeleteItem,
  onOpenItemForm,
  onOpenPaymentForm,
  onGeneratePDF
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totals = useMemo(() => calculateTotals(booking), [booking]);

  const formatCurrency = (amount: number, currency: Currency) => 
    `${currency} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <li className="flex flex-col transition-colors duration-200 hover:bg-gray-50">
      <div className="flex items-center p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(booking.id);
          }}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={e => e.stopPropagation()}
        />
        <div className="ml-4 flex-1">
          <p className="font-bold text-lg text-blue-700">{booking.reservationNumber}</p>
          <p className="text-sm text-gray-500">{booking.items.length} ítem(s)</p>
        </div>
        <div className="w-48 text-right">
          {/* FIX: Use Currency enum instead of string literal. */}
          <p className={`font-semibold ${totals.balanceARS !== 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totals.balanceARS, Currency.ARS)}</p>
          {/* FIX: Use Currency enum instead of string literal. */}
          <p className={`font-semibold ${totals.balanceUSD !== 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totals.balanceUSD, Currency.USD)}</p>
        </div>
        <div className="w-24 flex justify-end items-center">
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Detalles de la Reserva</h3>
            <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onGeneratePDF(booking); }} className="p-2 text-gray-500 hover:text-green-600 transition-colors"><FileTextIcon /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteBooking(booking.id); }} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><TrashIcon /></button>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Ítems/Servicios</h4>
              <button onClick={(e) => { e.stopPropagation(); onOpenItemForm(booking.id, null); }} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"><PlusCircleIcon/> Agregar</button>
            </div>
            {booking.items.length > 0 ? (
              <ul className="divide-y border rounded-lg">
                {booking.items.map(item => (
                  <li key={item.id} className="p-2 flex justify-between items-center">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-sm font-bold text-gray-600">{formatCurrency(item.value, item.currency)}</p>
                    </div>
                    <div>
                      <button onClick={(e) => { e.stopPropagation(); onOpenItemForm(booking.id, item); }} className="p-1 text-gray-400 hover:text-blue-600"><PencilIcon/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteItem(booking.id, item.id); }} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon/></button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 text-sm italic">No hay ítems en esta reserva.</p>}
          </div>

          {/* Payments Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Pagos</h4>
              <button onClick={(e) => { e.stopPropagation(); onOpenPaymentForm(booking.id); }} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"><DollarSignIcon/> Registrar Pago</button>
            </div>
            {booking.payments.length > 0 ? (
              <ul className="divide-y border rounded-lg">
                {booking.payments.map(payment => (
                  <li key={payment.id} className="p-2 flex justify-between items-center">
                    <p>Pago del {new Date(payment.date).toLocaleDateString('es-AR')}</p>
                    {/* FIX: Use Currency enum instead of string literal. */}
                    <p className="font-bold text-green-700">{formatCurrency(payment.amount, payment.currency)}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-gray-500 text-sm italic">No hay pagos registrados.</p>}
          </div>

          {/* Totals Summary */}
          <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen Financiero</h4>
              <div className="space-y-1 text-sm">
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between"><span className="text-gray-600">Total ARS:</span> <span>{formatCurrency(totals.totalARS, Currency.ARS)}</span></div>
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between"><span className="text-gray-600">Total USD:</span> <span>{formatCurrency(totals.totalUSD, Currency.USD)}</span></div>
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between text-green-700"><span >Total Pagado (ARS):</span> <span>{formatCurrency(totals.totalPaidARS, Currency.ARS)}</span></div>
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between text-green-700"><span >Total Pagado (USD):</span> <span>{formatCurrency(totals.totalPaidUSD, Currency.USD)}</span></div>
                <hr className="my-1"/>
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between font-bold"><span >Saldo Pendiente ARS:</span> <span>{formatCurrency(totals.balanceARS, Currency.ARS)}</span></div>
                {/* FIX: Use Currency enum instead of string literal. */}
                <div className="flex justify-between font-bold"><span >Saldo Pendiente USD:</span> <span>{formatCurrency(totals.balanceUSD, Currency.USD)}</span></div>
              </div>
          </div>
        </div>
      )}
    </li>
  );
});

export default BookingItem;
