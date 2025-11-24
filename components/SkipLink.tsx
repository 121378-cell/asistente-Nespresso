import React from 'react';

/**
 * SkipLink component for keyboard navigation accessibility
 * Allows users to skip directly to main content
 */
const SkipLink: React.FC = () => {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
            Saltar al contenido principal
        </a>
    );
};

export default SkipLink;
