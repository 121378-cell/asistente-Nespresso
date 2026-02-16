import React, { useState, useEffect } from 'react';
import { SavedRepair } from '../types';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';
import BookmarkIcon from './icons/BookmarkIcon';

interface SavedRepairsModalProps {
  onClose: () => void;
  onLoad: (repair: SavedRepair) => void;
  onSave: () => void;
  isSaveDisabled: boolean;
}

const SavedRepairsModal: React.FC<SavedRepairsModalProps> = ({
  onClose,
  onLoad,
  onSave,
  isSaveDisabled,
}) => {
  const [repairs, setRepairs] = useState<SavedRepair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepairs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { apiService } = await import('../services/apiService');
        const data = await apiService.getAllRepairs();
        setRepairs(data);
      } catch (error: unknown) {
        console.error('Failed to load repairs from API:', error);
        setError(
          'No se pudieron cargar las reparaciones. Asegúrate de que el backend esté funcionando.'
        );
        setRepairs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepairs();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar esta reparación guardada? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        const { apiService } = await import('../services/apiService');
        await apiService.deleteRepair(id);
        setRepairs(repairs.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Failed to delete repair:', error);
        alert('Hubo un error al eliminar la reparación.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Reparaciones Guardadas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b">
          <button
            onClick={onSave}
            disabled={isSaveDisabled}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow"
          >
            <BookmarkIcon className="w-5 h-5" />
            Guardar Conversación Actual
          </button>
          {isSaveDisabled && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              La conversación actual es muy corta para ser guardada.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando reparaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-gray-400 mt-2">
                Verifica que el backend esté funcionando en http://localhost:3001
              </p>
            </div>
          ) : repairs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No tienes ninguna reparación guardada todavía.</p>
              <p className="text-sm text-gray-400 mt-2">
                Usa el botón de arriba para guardar esta conversación.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {repairs.map((repair) => (
                <li
                  key={repair.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 overflow-hidden mr-2">
                    <p className="font-semibold text-gray-800 truncate" title={repair.name}>
                      {repair.name}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{repair.machineModel || 'Sin modelo'}</span>
                      {repair.serialNumber && (
                        <span className="font-mono text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                          N/S: {repair.serialNumber}
                        </span>
                      )}
                      &middot;
                      <span>{new Date(repair.timestamp).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => onLoad(repair)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50"
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => handleDelete(repair.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                      title="Eliminar reparación"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedRepairsModal;
