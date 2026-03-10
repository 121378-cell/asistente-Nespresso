import React, { useState, useEffect, useMemo } from 'react';
import apiService from '../services/apiService';
import SearchIcon from './icons/SearchIcon';
import TrashIcon from './icons/TrashIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SparePart {
  id: string;
  partNumber: string;
  name: string;
  family?: string;
}

interface SelectedPart extends SparePart {
  quantity: number;
}

interface SparePartsSelectorProps {
  onPartsChange: (parts: SelectedPart[]) => void;
  initialParts?: SelectedPart[];
}

const SparePartsSelector: React.FC<SparePartsSelectorProps> = ({
  onPartsChange,
  initialParts = [],
}) => {
  const [query, setQuery] = useState('');
  const [allParts, setAllParts] = useState<SparePart[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>(initialParts);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load all parts on mount
  useEffect(() => {
    const fetchAllParts = async () => {
      setIsLoading(true);
      try {
        const results = await apiService.getAllSpareParts();
        setAllParts(results || []);
      } catch (error) {
        console.error('Error fetching all spare parts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllParts();
  }, []);

  useEffect(() => {
    setSelectedParts(initialParts);
  }, [initialParts]);

  // Filter parts based on search query
  const filteredParts = useMemo(() => {
    if (!query.trim()) return allParts;
    const lowerQuery = query.toLowerCase();
    return allParts.filter(
      (part) =>
        part.name.toLowerCase().includes(lowerQuery) ||
        part.partNumber.toLowerCase().includes(lowerQuery)
    );
  }, [allParts, query]);

  const addPart = (part: SparePart) => {
    const existing = selectedParts.find((p) => p.id === part.id);
    let newParts;
    if (existing) {
      newParts = selectedParts.map((p) =>
        p.id === part.id ? { ...p, quantity: p.quantity + 1 } : p
      );
    } else {
      newParts = [...selectedParts, { ...part, quantity: 1 }];
    }
    setSelectedParts(newParts);
    onPartsChange(newParts);
    setQuery('');
    setShowDropdown(false);
  };

  const removePart = (partId: string) => {
    const newParts = selectedParts.filter((p) => p.id !== partId);
    setSelectedParts(newParts);
    onPartsChange(newParts);
  };

  const updateQuantity = (partId: string, delta: number) => {
    const newParts = selectedParts.map((p) => {
      if (p.id === partId) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    });
    setSelectedParts(newParts);
    onPartsChange(newParts);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Seleccionar Recambios</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar por nombre o referencia..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 p-4 text-center border rounded-md shadow-lg">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Cargando inventario...</p>
          </div>
        )}

        {showDropdown && !isLoading && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
            <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700">
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <li
                    key={part.id}
                    onClick={() => addPart(part)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 border-b border-gray-50 last:border-0 dark:border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{part.name}</span>
                      <span className="text-[10px] uppercase font-bold opacity-60">
                        Ref: {part.partNumber} {part.family ? `| ${part.family}` : ''}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-gray-500 text-xs">
                  No se encontraron recambios que coincidan
                </li>
              )}
            </ul>
          </>
        )}
      </div>

      {selectedParts.length > 0 && (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Cant
                </th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {selectedParts.map((part) => (
                <tr
                  key={part.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                    {part.partNumber}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-medium">
                    {part.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(part.id, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="w-4 font-bold text-blue-600">{part.quantity}</span>
                      <button
                        onClick={() => updateQuantity(part.id, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removePart(part.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SparePartsSelector;
