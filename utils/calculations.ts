import { Currency, type Booking } from '../types';

export const calculateTotals = (booking: Booking) => {
  const totalARS = booking.items
    // FIX: Use Currency enum for comparison instead of string literal.
    .filter(item => item.currency === Currency.ARS)
    .reduce((sum, item) => sum + item.value, 0);

  const totalUSD = booking.items
    // FIX: Use Currency enum for comparison instead of string literal.
    .filter(item => item.currency === Currency.USD)
    .reduce((sum, item) => sum + item.value, 0);

  const totalPaidARS = booking.payments
    .filter(p => p.currency === Currency.ARS)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPaidUSD = booking.payments
    .filter(p => p.currency === Currency.USD)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const balanceARS = totalARS - totalPaidARS;
  const balanceUSD = totalUSD - totalPaidUSD;

  return {
    totalARS,
    totalUSD,
    totalPaidARS,
    totalPaidUSD,
    balanceARS,
    balanceUSD,
  };
};