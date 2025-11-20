
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 font-medium">El asistente está pensando...</span>
        </div>
    </div>
  );
};

export default LoadingSpinner;
