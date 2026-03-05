import React, { useState } from 'react';
import { parseSerialNumber } from '../utils/machineUtils';
import CloseIcon from './icons/CloseIcon';
import SearchIcon from './icons/SearchIcon';

interface CreateReportModalProps {
  onClose: () => void;
  onIdentify: (data: { model: string; serialNumber: string }) => void;
}

const CreateReportModal: React.FC<CreateReportModalProps> = ({ onClose, onIdentify }) => {
  const [serial, setSerial] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!serial.trim()) {
      setError('Por favor, introduce un número de serie.');
      return;
    }

    const result = parseSerialNumber(serial);

    if (result) {
      onIdentify({ model: result.model, serialNumber: result.serial });
    } else {
      setError(
        "No se reconoce el modelo. Asegúrate de introducir un número de serie válido (ej: para Zenius debe contener una 'Z' en la 6ª posición)."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">CREAR PARTE</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
            Introduce el número de serie de la máquina para cargar el checklist y el inventario de
            recambios correspondiente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="serialNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Número de Serie:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="serialNumber"
                  value={serial}
                  onChange={(e) => {
                    setSerial(e.target.value);
                    setError(null);
                  }}
                  placeholder="Ej: 11345Z..."
                  className={`flex-1 px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoFocus
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <SearchIcon className="w-5 h-5" />
              IDENTIFICAR Y ABRIR PARTE
            </button>
          </form>

          <div className="mt-8 pt-6 border-t dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Modelos soportados
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium border border-blue-200 dark:border-blue-800">
                Zenius (ZN100)
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600">
                Gemini (Próximamente)
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600">
                Momento (Próximamente)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReportModal;
