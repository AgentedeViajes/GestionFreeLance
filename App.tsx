import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Currency, type Booking, type Item, type Payment } from './types';
import { generateBookingPDF, generateConsolidatedPDF } from './services/pdfGenerator';
import BookingList from './components/BookingList';
import Modal from './components/Modal';
import ItemForm from './components/forms/ItemForm';
import PaymentForm from './components/forms/PaymentForm';
import BookingForm from './components/forms/BookingForm';
import { PlusIcon, FileTextIcon, TrashIcon, LogOutIcon } from './components/icons';
import FreelancerManager from './components/FreelancerLogin';

const App: React.FC = () => {
  const [allBookings, setAllBookings] = useState<Record<string, Booking[]>>({});
  const [currentFreelancer, setCurrentFreelancer] = useState<string | null>(null);
  
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('freelanceBookings');
      if (storedData) {
        setAllBookings(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to load bookings from localStorage", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('freelanceBookings', JSON.stringify(allBookings));
    } catch (error) {
      console.error("Failed to save bookings to localStorage", error);
    }
  }, [allBookings]);

  const bookings = useMemo(() => {
    if (!currentFreelancer) return [];
    return allBookings[currentFreelancer] || [];
  }, [allBookings, currentFreelancer]);
  
  const handleLogin = (freelancerName: string) => {
    setCurrentFreelancer(freelancerName);
    setSelectedBookings(new Set()); // Reset selection on user change
  };

  const handleLogout = () => {
    setCurrentFreelancer(null);
  };

  const handleAddFreelancer = (name: string) => {
    if (allBookings[name]) {
      alert('Ya existe un freelancer con este nombre.');
      return;
    }
    setAllBookings(prev => ({ ...prev, [name]: [] }));
  };

  const handleUpdateFreelancerName = (oldName: string, newName: string) => {
    if (!newName.trim()) {
      alert('El nombre no puede estar vacío.');
      return;
    }
    if (allBookings[newName] && oldName !== newName) {
      alert('Ya existe un freelancer con este nombre.');
      return;
    }
    
    setAllBookings(prev => {
      const updatedBookings = { ...prev };
      if (oldName !== newName) {
        updatedBookings[newName] = updatedBookings[oldName];
        delete updatedBookings[oldName];
      }
      return updatedBookings;
    });
  };

  const handleDeleteFreelancer = (name: string) => {
    setAllBookings(prev => {
      const updatedBookings = { ...prev };
      delete updatedBookings[name];
      return updatedBookings;
    });
  };

  const handleSelectBooking = useCallback((bookingId: string) => {
    setSelectedBookings(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(bookingId)) {
        newSelection.delete(bookingId);
      } else {
        newSelection.add(bookingId);
      }
      return newSelection;
    });
  }, []);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };
  
  const closeModal = () => setIsModalOpen(false);

  const updateCurrentFreelancerBookings = (updater: (prevBookings: Booking[]) => Booking[]) => {
    if (!currentFreelancer) return;
    setAllBookings(prevAll => ({
      ...prevAll,
      [currentFreelancer]: updater(prevAll[currentFreelancer] || []),
    }));
  };

  const handleAddBooking = (reservationNumber: string) => {
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      reservationNumber,
      items: [],
      payments: [],
      createdAt: new Date().toISOString(),
    };
    updateCurrentFreelancerBookings(prev => [newBooking, ...prev]);
    closeModal();
  };

  const handleDeleteBooking = useCallback((bookingId: string) => {
    const bookingToDelete = bookings.find(b => b.id === bookingId);
    if (!bookingToDelete) return;

    const confirmDelete = () => {
      updateCurrentFreelancerBookings(prev => prev.filter(b => b.id !== bookingId));
      setSelectedBookings(prev => {
        const newSelection = new Set(prev);
        newSelection.delete(bookingId);
        return newSelection;
      });
      closeModal();
    };

    openModal(
      'Confirmar Eliminación',
      (
        <div>
          <p className="mb-6">
            ¿Está seguro de que desea eliminar la reserva <strong>#{bookingToDelete.reservationNumber}</strong>?
            <br />
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Eliminar Reserva
            </button>
          </div>
        </div>
      )
    );
  }, [bookings, currentFreelancer]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedBookings.size === 0) return;

    const confirmDelete = () => {
        updateCurrentFreelancerBookings(prev => prev.filter(b => !selectedBookings.has(b.id)));
        setSelectedBookings(new Set());
        closeModal();
    };

    openModal('Confirmar Eliminación Múltiple', (
      <div>
        <p className="mb-6">
            ¿Está seguro de que desea eliminar las <strong>{selectedBookings.size}</strong> reservas seleccionadas?
            <br />
            Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={confirmDelete} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Eliminar ({selectedBookings.size})</button>
        </div>
      </div>
    ));
  }, [selectedBookings, currentFreelancer]);

  const handleDeleteAll = useCallback(() => {
    if (bookings.length === 0) return;
    
    const confirmDelete = () => {
        updateCurrentFreelancerBookings(() => []);
        setSelectedBookings(new Set());
        closeModal();
    };

    openModal('Confirmar Eliminación Total', (
      <div>
        <p className="mb-6">
            ¿Está seguro de que desea eliminar <strong>TODAS ({bookings.length})</strong> las reservas de {currentFreelancer}?
            <br />
            Esta acción es irreversible.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={closeModal} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button onClick={confirmDelete} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Sí, Eliminar Todo</button>
        </div>
      </div>
    ));
  }, [bookings.length, currentFreelancer]);
  
  const handleAddItem = useCallback((bookingId: string, item: Omit<Item, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    updateCurrentFreelancerBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, items: [...b.items, newItem] } : b
    ));
    closeModal();
  }, [currentFreelancer]);

  const handleUpdateItem = useCallback((bookingId: string, updatedItem: Item) => {
    updateCurrentFreelancerBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, items: b.items.map(i => i.id === updatedItem.id ? updatedItem : i) } : b
    ));
    closeModal();
  }, [currentFreelancer]);

  const handleDeleteItem = useCallback((bookingId: string, itemId: string) => {
    updateCurrentFreelancerBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, items: b.items.filter(i => i.id !== itemId) } : b
    ));
  }, [currentFreelancer]);

  const handleAddPayment = useCallback((bookingId: string, payment: Omit<Payment, 'id'>) => {
    const newPayment = { ...payment, id: crypto.randomUUID() };
    updateCurrentFreelancerBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, payments: [...b.payments, newPayment] } : b
    ));
    closeModal();
  }, [currentFreelancer]);

  const handleGeneratePDF = (booking: Booking) => {
    if(currentFreelancer) {
      generateBookingPDF(booking, currentFreelancer);
    }
  };

  const openAddBookingForm = () => openModal('Nueva Reserva', <BookingForm onSubmit={handleAddBooking} onCancel={closeModal} />);
  const openItemForm = (bookingId: string, item: Item | null = null) => openModal(item ? 'Editar Ítem' : 'Agregar Ítem', <ItemForm bookingId={bookingId} item={item} onSubmit={item ? (id, data) => handleUpdateItem(id, { ...data, id: item.id }) : handleAddItem} onCancel={closeModal} />);
  const openPaymentForm = (bookingId: string) => openModal('Agregar Pago', <PaymentForm bookingId={bookingId} onSubmit={handleAddPayment} onCancel={closeModal} />);

  const handleGenerateConsolidated = () => {
    if (selectedBookings.size === 0) {
      alert("Por favor, seleccione al menos una reserva para generar el reporte.");
      return;
    }
    const bookingsToPrint = bookings.filter(b => selectedBookings.has(b.id));
    if(currentFreelancer) {
      generateConsolidatedPDF(bookingsToPrint, currentFreelancer);
    }
  };

  const isAllSelected = useMemo(() => bookings.length > 0 && selectedBookings.size === bookings.length, [bookings.length, selectedBookings.size]);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(bookings.map(b => b.id)));
    }
  };

  if (!currentFreelancer) {
    return (
      <FreelancerManager
        freelancers={Object.keys(allBookings).sort()}
        onLogin={handleLogin}
        onAdd={handleAddFreelancer}
        onEdit={handleUpdateFreelancerName}
        onDelete={handleDeleteFreelancer}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-700">Gestor de Reservas</h1>
            <p className="text-sm text-blue-600 font-semibold">{currentFreelancer}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateConsolidated}
              disabled={selectedBookings.size === 0}
              className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileTextIcon />
              <span>Reporte ({selectedBookings.size})</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedBookings.size === 0}
              className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <TrashIcon />
              <span>Eliminar ({selectedBookings.size})</span>
            </button>
            <div className="h-8 w-px bg-gray-300 mx-2"></div>
            <button
              onClick={handleDeleteAll}
              disabled={bookings.length === 0}
              className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              title="Eliminar todas las reservas"
            >
              <TrashIcon />
              <span>Eliminar Todo</span>
            </button>
            <button
              onClick={openAddBookingForm}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              <span>Nueva Reserva</span>
            </button>
             <div className="h-8 w-px bg-gray-300 mx-2"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
              title="Cambiar de Usuario"
            >
              <LogOutIcon />
              <span>Cambiar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <BookingList 
          bookings={bookings}
          selectedBookings={selectedBookings}
          onSelectBooking={handleSelectBooking}
          onDeleteBooking={handleDeleteBooking}
          onDeleteItem={handleDeleteItem}
          onOpenItemForm={openItemForm}
          onOpenPaymentForm={openPaymentForm}
          onSelectAll={handleSelectAll}
          onGeneratePDF={handleGeneratePDF}
          isAllSelected={isAllSelected}
        />
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default App;