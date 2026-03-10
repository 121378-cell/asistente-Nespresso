import React, { useState, useEffect } from 'react';
import { SavedRepair, UsedPart } from '../types';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import ToolIcon from './icons/ToolIcon';
import SparePartsSelector from './SparePartsSelector';
import { apiService } from '../services/apiService';
import { db, LocalRepair } from '../src/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface SavedRepairsModalProps {
  onClose: () => void;
  onLoad: (repair: SavedRepair) => void;
  onSave: (usedParts: UsedPart[]) => void;
  isSaveDisabled: boolean;
  selectedParts: UsedPart[];
  onSelectedPartsChange: (parts: UsedPart[]) => void;
}

const SavedRepairsModal: React.FC<SavedRepairsModalProps> = ({
  onClose,
  onLoad,
  onSave,
  isSaveDisabled,
  selectedParts,
  onSelectedPartsChange,
}) => {
  const localRepairs = useLiveQuery(() => db.repairs.orderBy('timestamp').reverse().toArray());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncWithApi = async () => {
      try {
        setIsLoading(true);
        const remoteRepairs = await apiService.getAllRepairs();

        // Sync remote repairs to local DB
        for (const remote of remoteRepairs) {
          const existing = await db.repairs.where('id').equals(remote.id).first();
          if (!existing) {
            await db.repairs.add({
              ...remote,
              isSynced: true,
            } as LocalRepair);
          } else {
            // Update existing if needed (timestamp comparison could be used)
            await db.repairs.update(existing.localId!, {
              ...remote,
              isSynced: true,
            });
          }
        }
      } catch (error: unknown) {
        console.warn('Could not sync with API, using local data only:', error);
        // Don't show error to user if we have local data
        if (!localRepairs || localRepairs.length === 0) {
          setError('Modo offline: No hay datos locales y el servidor no responde.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    syncWithApi();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleDelete = async (repair: LocalRepair) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar esta reparación? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        // 1. Delete locally
        if (repair.localId !== undefined) {
          await db.repairs.delete(repair.localId);
        }

        // 2. Try to delete remotely if it was synced
        if (repair.id && repair.isSynced) {
          await apiService.deleteRepair(repair.id);
        }
      } catch (error) {
        console.error('Failed to delete repair:', error);
        // Even if remote delete fails, local is gone, so UI will update
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">Reparaciones Guardadas</h2>
            {isLoading && (
              <span className="text-xs text-blue-500 animate-pulse">Sincronizando...</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b bg-blue-50 dark:bg-blue-900/20">
          <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
            <ToolIcon className="w-4 h-4" />
            Recambios utilizados en esta reparación:
          </h3>

          <SparePartsSelector
            initialParts={selectedParts}
            onPartsChange={(parts) => onSelectedPartsChange(parts)}
          />

          <button
            onClick={() => onSave(selectedParts)}
            disabled={isSaveDisabled}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow"
          >
            <BookmarkIcon className="w-5 h-5" />
            Guardar con {selectedParts.length} recambios
          </button>
          {isSaveDisabled && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              La conversación actual es muy corta para ser guardada.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!localRepairs && isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando reparaciones...</p>
            </div>
          ) : error && (!localRepairs || localRepairs.length === 0) ? (
            <div className="text-center py-10">
              <p className="text-red-600">{error}</p>
            </div>
          ) : !localRepairs || localRepairs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No tienes ninguna reparación guardada todavía.</p>
              <p className="text-sm text-gray-400 mt-2">
                Usa el botón de arriba para guardar esta conversación.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {localRepairs.map((repair) => (
                <li
                  key={repair.localId || repair.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 overflow-hidden mr-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 truncate" title={repair.name}>
                        {repair.name}
                      </p>
                      {!repair.isSynced && (
                        <span
                          className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200"
                          title="Pendiente de sincronizar"
                        >
                          Local
                        </span>
                      )}
                    </div>
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
                      onClick={() => onLoad(repair as any)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50"
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => handleDelete(repair)}
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
