import React, { useEffect, useRef, useState } from 'react';
import { UsedPart } from '../types';
import SparePartsSelector from './SparePartsSelector';
import ToolIcon from './icons/ToolIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface SparePartsDropdownProps {
  selectedParts: UsedPart[];
  onSelectedPartsChange: (parts: UsedPart[]) => void;
}

const SparePartsDropdown: React.FC<SparePartsDropdownProps> = ({
  selectedParts,
  onSelectedPartsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const totalUnits = selectedParts.reduce((sum, part) => sum + part.quantity, 0);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        title="Apuntar recambios usados"
      >
        <ToolIcon className="w-5 h-5" />
        <span className="hidden md:inline">Recambios</span>
        {totalUnits > 0 && (
          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
            {totalUnits}
          </span>
        )}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-20">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Recambios usados en esta reparación
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Añade recambios y cantidad en cualquier momento. Se guardarán al guardar la reparación.
          </p>
          <SparePartsSelector initialParts={selectedParts} onPartsChange={onSelectedPartsChange} />
        </div>
      )}
    </div>
  );
};

export default SparePartsDropdown;
