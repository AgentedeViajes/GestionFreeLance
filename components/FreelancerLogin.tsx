import React, { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, UserIcon } from './icons';
import Modal from './Modal';

interface FreelancerManagerProps {
  freelancers: string[];
  onLogin: (name: string) => void;
  onAdd: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

const FreelancerForm: React.FC<{
  onSubmit: (name: string) => void;
  onCancel: () => void;
  initialName?: string;
  existingNames: string[];
}> = ({ onSubmit, onCancel, initialName = '', existingNames }) => {
  const [name, setName] = useState(initialName);
  const nameExists = existingNames.includes(name.trim()) && name.trim() !== initialName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !nameExists) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="freelancerName" className="block text-sm font-medium text-gray-700">
          Nombre del Freelancer
        </label>
        <input
          type="text"
          id="freelancerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Ingrese un nombre"
          required
          autoFocus
        />
        {nameExists && <p className="text-red-500 text-sm mt-1">Este nombre ya está en uso.</p>}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={nameExists || !name.trim()} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
          Guardar
        </button>
      </div>
    </form>
  );
};

const DeleteConfirmation: React.FC<{
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ name, onConfirm, onCancel }) => (
  <div>
    <p className="mb-6">
      ¿Está seguro de que desea eliminar el perfil de <strong>{name}</strong>?
      <br />
      Todas sus reservas y datos asociados se perderán permanentemente.
    </p>
    <div className="flex justify-end gap-2">
      <button onClick={onCancel} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
        Cancelar
      </button>
      <button onClick={onConfirm} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
        Sí, Eliminar Perfil
      </button>
    </div>
  </div>
);


const FreelancerManager: React.FC<FreelancerManagerProps> = ({ freelancers, onLogin, onAdd, onEdit, onDelete }) => {
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (title: string, content: React.ReactNode) => {
        setModalTitle(title);
        setModalContent(content);
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    const handleAdd = () => {
        openModal('Crear Nuevo Perfil', 
            <FreelancerForm 
                onSubmit={(newName) => { onAdd(newName); closeModal(); }} 
                onCancel={closeModal}
                existingNames={freelancers}
            />
        );
    };

    const handleEdit = (oldName: string) => {
        openModal('Editar Nombre del Perfil', 
            <FreelancerForm 
                initialName={oldName}
                onSubmit={(newName) => { onEdit(oldName, newName); closeModal(); }} 
                onCancel={closeModal}
                existingNames={freelancers}
            />
        );
    };

    const handleDelete = (name: string) => {
        openModal(`Eliminar Perfil: ${name}`,
            <DeleteConfirmation
                name={name}
                onConfirm={() => { onDelete(name); closeModal(); }}
                onCancel={closeModal}
            />
        );
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Gestor de Reservas
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Seleccione un perfil o cree uno nuevo para comenzar.
        </p>
        
        <div className="space-y-4 mb-8">
            {freelancers.length > 0 ? (
                freelancers.map(name => (
                    <div key={name} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <button onClick={() => onLogin(name)} className="flex items-center gap-4 text-left flex-grow">
                             <span className="text-blue-500"><UserIcon/></span>
                             <span className="text-xl font-semibold text-gray-700">{name}</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(name)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Editar nombre">
                                <PencilIcon/>
                            </button>
                            <button onClick={() => handleDelete(name)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" title="Eliminar perfil">
                                <TrashIcon/>
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                    <p className="text-gray-500">No hay perfiles. ¡Cree el primero para empezar!</p>
                </div>
            )}
        </div>

        <div>
            <button
              onClick={handleAdd}
              className="group w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon/>
              Crear Nuevo Perfil
            </button>
          </div>
      </div>
       <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default FreelancerManager;
