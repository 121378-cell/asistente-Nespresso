import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Componente de fallback para mostrar durante la carga de componentes lazy
 * Diseñado para ser ligero y rápido de renderizar
 */
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Cargando...',
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {message && <p className="mt-4 text-gray-600 text-sm font-medium">{message}</p>}
    </div>
  );
};

export default LoadingFallback;
