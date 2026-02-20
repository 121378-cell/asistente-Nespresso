import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import SearchIcon from './icons/SearchIcon';
import TrashIcon from './icons/TrashIcon';

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
  const [searchResults, setSearchResults] = useState<SparePart[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>(initialParts);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const results = await apiService.searchSpareParts(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching parts:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

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
    setSearchResults([]);
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recambio por nombre o referencia..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
        />

        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {searchResults.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {searchResults.map((part) => (
              <li
                key={part.id}
                onClick={() => addPart(part)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700"
              >
                <div className="flex justify-between">
                  <span className="font-medium truncate">{part.name}</span>
                  <span className="text-xs opacity-70">{part.partNumber}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedParts.length > 0 && (
        <div className="border rounded-md overflow-hidden bg-white dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recambio
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cant
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {selectedParts.map((part) => (
                <tr key={part.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-500">
                    {part.partNumber}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {part.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateQuantity(part.id, -1)}
                        className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700"
                      >
                        -
                      </button>
                      <span className="w-4">{part.quantity}</span>
                      <button
                        onClick={() => updateQuantity(part.id, 1)}
                        className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => removePart(part.id)}
                      className="text-red-500 hover:text-red-700"
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
