// FIX: Use Currency enum instead of string literals. Import Currency as a value.
import { Currency, type Booking, type Item } from '../types';
import { calculateTotals } from '../utils/calculations';

// Declare jspdf on the window object to satisfy TypeScript
declare global {
  interface Window {
    jspdf: any;
  }
}

const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR');
};

const addBookingContentToDoc = (doc: any, booking: Booking, freelancerName: string) => {
  const totals = calculateTotals(booking);

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text(`Estado de Cuenta - Reserva #${booking.reservationNumber}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Freelancer: ${freelancerName}`, 14, 30);
  doc.text(`Fecha de Creación: ${formatDate(booking.createdAt)}`, doc.internal.pageSize.getWidth() - 14, 30, { align: 'right' });


  // Items Table
  if (booking.items.length > 0) {
    doc.autoTable({
      startY: 40,
      head: [['Servicio', 'Moneda', 'Valor']],
      body: booking.items.map(item => [
        item.name,
        item.currency,
        formatCurrency(item.value, item.currency),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    });
  }

  // Payments Table
  if (booking.payments.length > 0) {
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Fecha de Pago', 'Moneda', 'Monto Pagado']],
      body: booking.payments.map(payment => [
        formatDate(payment.date),
        payment.currency,
        formatCurrency(payment.amount, payment.currency),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });
  }

  // Totals Section
  const finalY = doc.autoTable.previous.finalY || 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen', 14, finalY + 15);

  const summaryData = [
    // FIX: Use Currency enum instead of string literal.
    ['Total ARS:', formatCurrency(totals.totalARS, Currency.ARS)],
    // FIX: Use Currency enum instead of string literal.
    ['Total USD:', formatCurrency(totals.totalUSD, Currency.USD)],
    // FIX: Use Currency enum instead of string literal.
    ['Total Pagado (ARS):', formatCurrency(totals.totalPaidARS, Currency.ARS)],
    // FIX: Use Currency enum instead of string literal.
    ['Total Pagado (USD):', formatCurrency(totals.totalPaidUSD, Currency.USD)],
    // FIX: Use Currency enum instead of string literal.
    ['Saldo ARS:', formatCurrency(totals.balanceARS, Currency.ARS)],
    // FIX: Use Currency enum instead of string literal.
    ['Saldo USD:', formatCurrency(totals.balanceUSD, Currency.USD)],
  ];

  doc.autoTable({
    startY: finalY + 20,
    body: summaryData,
    theme: 'plain',
    styles: { fontStyle: 'bold' },
    columnStyles: { 
      0: { halign: 'left' },
      1: { halign: 'right' } 
    }
  });
};

export const generateBookingPDF = (booking: Booking, freelancerName: string) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  addBookingContentToDoc(doc, booking, freelancerName);
  doc.save(`Reserva_${booking.reservationNumber}.pdf`);
};

export const generateConsolidatedPDF = (bookings: Booking[], freelancerName: string) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let grandTotalBalanceARS = 0;
  let grandTotalBalanceUSD = 0;
  
  doc.setFontSize(20);
  doc.text('Reporte Consolidado de Reservas', 14, 22);
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Freelancer: ${freelancerName}`, 14, 30);

  const reportBody = bookings.map(booking => {
      const totals = calculateTotals(booking);
      grandTotalBalanceARS += totals.balanceARS;
      grandTotalBalanceUSD += totals.balanceUSD;
      return [
          booking.reservationNumber,
          // FIX: Use Currency enum instead of string literal.
          formatCurrency(totals.balanceARS, Currency.ARS),
          // FIX: Use Currency enum instead of string literal.
          formatCurrency(totals.balanceUSD, Currency.USD),
      ];
  });

  doc.autoTable({
      startY: 40,
      head: [['# Reserva', 'Saldo Pendiente ARS', 'Saldo Pendiente USD']],
      body: reportBody,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
  });

  const finalY = doc.autoTable.previous.finalY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Totales Generales', 14, finalY + 15);

  doc.autoTable({
      startY: finalY + 20,
      body: [
          // FIX: Use Currency enum instead of string literal.
          ['Total Saldo Pendiente ARS:', formatCurrency(grandTotalBalanceARS, Currency.ARS)],
          // FIX: Use Currency enum instead of string literal.
          ['Total Saldo Pendiente USD:', formatCurrency(grandTotalBalanceUSD, Currency.USD)],
          ['Cantidad de Reservas:', bookings.length.toString()],
      ],
      theme: 'plain',
      styles: { fontSize: 12, fontStyle: 'bold' },
      columnStyles: { 
          0: { halign: 'left' },
          1: { halign: 'right' } 
      }
  });

  doc.save(`Reporte_Consolidado_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`);
};
